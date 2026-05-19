import { KarposClient } from '@karpos/sdk';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export function getBrowserClient(): KarposClient {
  return new KarposClient({ baseUrl: API_BASE_URL });
}
