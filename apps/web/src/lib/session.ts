import { cookies } from 'next/headers';

export type SessionUser = {
  userId: string;
  orgId: string;
  email: string;
  fullName: string;
  permissions: string[];
};

export function getSession(): SessionUser | null {
  const c = cookies();
  const raw = c.get('karpos.session')?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as SessionUser;
  } catch {
    return null;
  }
}

export function requireSession(): SessionUser {
  const session = getSession();
  if (!session) {
    throw new Error('unauthenticated');
  }
  return session;
}

export function hasPermission(session: SessionUser | null, permission: string): boolean {
  if (!session) return false;
  return session.permissions.includes('*') || session.permissions.includes(permission);
}
