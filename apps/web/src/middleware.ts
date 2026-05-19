import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = process.env.KARPOS_COOKIE_NAME ?? 'karpos.session';

export function middleware(req: NextRequest) {
  const session = req.cookies.get(COOKIE_NAME);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/console/:path*'],
};
