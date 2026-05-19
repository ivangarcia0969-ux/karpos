import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const COOKIE_NAME = process.env.KARPOS_COOKIE_NAME ?? 'karpos.session';

export async function POST(req: Request) {
  const cookieHeader = req.headers.get('cookie') ?? '';
  await fetch(`${API_BASE_URL}/v1/auth/logout`, {
    method: 'POST',
    headers: { cookie: cookieHeader },
  }).catch(() => undefined);
  const res = NextResponse.redirect(new URL('/login', req.url));
  res.cookies.delete(COOKIE_NAME);
  return res;
}
