import 'server-only';
import { KarposClient } from '@karpos/sdk';
import { cookies, headers } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const COOKIE_NAME = process.env.KARPOS_COOKIE_NAME ?? 'karpos.session';

export function getServerClient(): KarposClient {
  return new KarposClient({
    baseUrl: API_BASE_URL,
    fetch: (input, init) => {
      const c = cookies();
      const token = c.get(COOKIE_NAME)?.value;
      const reqHeaders = new Headers(init?.headers);
      if (token) reqHeaders.set('cookie', `${COOKIE_NAME}=${token}`);
      const forwardedHost = headers().get('host');
      if (forwardedHost) reqHeaders.set('x-forwarded-host', forwardedHost);
      return fetch(input, { ...init, headers: reqHeaders, cache: 'no-store', next: { revalidate: 0 } });
    },
  });
}
