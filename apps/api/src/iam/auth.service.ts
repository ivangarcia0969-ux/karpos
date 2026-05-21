import { Inject, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { DRIZZLE, type Database } from '../database/database.module.js';
import { users, memberships } from '../database/schema/iam.js';
import { organizations } from '../database/schema/organizations.js';
import { loadEnv } from '../config/env.js';

export type Principal = {
  userId: string;
  orgId: string;
  email: string;
  displayName: string;
  role: string;
};

@Injectable()
export class AuthService {
  private readonly secret: Uint8Array;
  private readonly expiresIn: string;

  constructor(@Inject(DRIZZLE) private readonly db: Database) {
    const env = loadEnv();
    this.secret = new TextEncoder().encode(env.JWT_SECRET);
    this.expiresIn = env.JWT_EXPIRES_IN;
  }

  async register(input: {
    email: string;
    password: string;
    displayName: string;
    organization: { legalName: string; displayName: string; slug: string; countryCode: string };
  }): Promise<{ token: string; principal: Principal }> {
    const existing = await this.db.select({ id: users.id }).from(users).where(eq(users.email, input.email));
    if (existing.length) throw new ConflictException('email_already_registered');

    const passwordHash = await bcrypt.hash(input.password, 10);

    return await this.db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          legalName: input.organization.legalName,
          displayName: input.organization.displayName,
          slug: input.organization.slug,
          countryCode: input.organization.countryCode,
        })
        .returning();

      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          displayName: input.displayName,
        })
        .returning();

      await tx.insert(memberships).values({
        orgId: org!.id,
        userId: user!.id,
        role: 'owner',
      });

      const principal: Principal = {
        userId: user!.id,
        orgId: org!.id,
        email: user!.email,
        displayName: user!.displayName,
        role: 'owner',
      };
      const token = await this.signToken(principal);
      return { token, principal };
    });
  }

  async login(email: string, password: string): Promise<{ token: string; principal: Principal }> {
    const [row] = await this.db
      .select({
        userId: users.id,
        email: users.email,
        displayName: users.displayName,
        passwordHash: users.passwordHash,
        orgId: memberships.orgId,
        role: memberships.role,
      })
      .from(users)
      .innerJoin(memberships, eq(memberships.userId, users.id))
      .where(and(eq(users.email, email), eq(users.status, 'active')))
      .limit(1);

    if (!row) throw new UnauthorizedException('invalid_credentials');

    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) throw new UnauthorizedException('invalid_credentials');

    const principal: Principal = {
      userId: row.userId,
      orgId: row.orgId,
      email: row.email,
      displayName: row.displayName,
      role: row.role,
    };
    const token = await this.signToken(principal);
    return { token, principal };
  }

  async verifyToken(token: string): Promise<Principal> {
    try {
      const { payload } = await jwtVerify(token, this.secret, { audience: 'karpos', issuer: 'karpos' });
      const p = payload as unknown as Principal & { exp?: number };
      if (!p.userId || !p.orgId || !p.email) throw new Error('missing_claims');
      return {
        userId: p.userId,
        orgId: p.orgId,
        email: p.email,
        displayName: p.displayName ?? p.email,
        role: p.role ?? 'member',
      };
    } catch {
      throw new UnauthorizedException('invalid_token');
    }
  }

  private async signToken(principal: Principal): Promise<string> {
    return await new SignJWT({ ...principal })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer('karpos')
      .setAudience('karpos')
      .setExpirationTime(this.expiresIn)
      .sign(this.secret);
  }
}
