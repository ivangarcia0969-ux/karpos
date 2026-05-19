import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export type SessionUser = {
  userId: string;
  orgId: string;
  email: string;
  displayName: string;
  role: string;
};

const COOKIE_NAME = process.env.KARPOS_COOKIE_NAME ?? 'karpos.session';
const JWT_SECRET = process.env.JWT_SECRET ?? '';
const secretBytes = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;

export async function getSession(): Promise<SessionUser | null> {
  const c = cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token || !secretBytes) return null;
  try {
    const { payload } = await jwtVerify(token, secretBytes, { audience: 'karpos', issuer: 'karpos' });
    const p = payload as unknown as SessionUser;
    if (!p.userId || !p.orgId || !p.email) return null;
    return {
      userId: p.userId,
      orgId: p.orgId,
      email: p.email,
      displayName: p.displayName ?? p.email,
      role: p.role ?? 'member',
    };
  } catch {
    return null;
  }
}
