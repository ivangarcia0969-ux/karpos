import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { loadEnv } from '../config/env.js';

export type Principal = {
  userId: string;
  orgId: string;
  email: string;
  permissions: string[];
  roles: string[];
};

@Injectable()
export class AuthService {
  private readonly jwks;
  private readonly audience: string;
  private readonly issuer: string;

  constructor() {
    const env = loadEnv();
    this.audience = env.JWT_AUDIENCE;
    this.issuer = env.JWT_ISSUER;
    this.jwks = createRemoteJWKSet(new URL(`${env.OIDC_ISSUER}/protocol/openid-connect/certs`));
  }

  async verifyToken(token: string): Promise<Principal> {
    let payload: JWTPayload & { karpos?: { org_id?: string; permissions?: string[]; roles?: string[] } };
    try {
      const result = await jwtVerify(token, this.jwks, {
        audience: this.audience,
        issuer: this.issuer,
      });
      payload = result.payload as typeof payload;
    } catch {
      throw new UnauthorizedException('invalid_token');
    }

    const orgId = payload.karpos?.org_id;
    if (!orgId || !payload.sub || typeof payload.email !== 'string') {
      throw new UnauthorizedException('missing_claims');
    }

    return {
      userId: payload.sub,
      orgId,
      email: payload.email,
      permissions: payload.karpos?.permissions ?? [],
      roles: payload.karpos?.roles ?? [],
    };
  }
}
