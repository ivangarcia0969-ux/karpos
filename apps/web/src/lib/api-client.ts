import { KarposClient } from '@karpos/sdk';
import { cookies } from 'next/headers';

export function getServerClient(): KarposClient {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  return new KarposClient({
    baseUrl,
    getToken: async () => {
      const c = cookies();
      return c.get('karpos.access_token')?.value ?? null;
    },
    fetch: (input, init) =>
      fetch(input, { ...init, cache: 'no-store', next: { revalidate: 0 } }),
  });
}
