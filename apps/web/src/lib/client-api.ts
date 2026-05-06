import { KarposClient } from '@karpos/sdk';

function readTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)karpos\.access_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export const clientApi = new KarposClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000',
  getToken: readTokenFromCookie,
});
