import { synchronize } from '@nozbe/watermelondb/sync';
import * as SecureStore from 'expo-secure-store';
import { database } from './database';

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function syncOnce(): Promise<{ pulled: number; pushed: number }> {
  let pulled = 0;
  let pushed = 0;

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const token = await SecureStore.getItemAsync('karpos.access_token');
      const res = await fetch(`${BASE}/v1/sync/pull?since=${lastPulledAt ?? 0}`, {
        headers: { authorization: `Bearer ${token ?? ''}` },
      });
      if (!res.ok) throw new Error(`pull failed ${res.status}`);
      const { changes, timestamp } = (await res.json()) as { changes: Record<string, unknown>; timestamp: number };
      pulled = Object.values(changes).reduce((acc: number, t) => {
        const tbl = t as { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] };
        return acc + (tbl.created?.length ?? 0) + (tbl.updated?.length ?? 0) + (tbl.deleted?.length ?? 0);
      }, 0);
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const token = await SecureStore.getItemAsync('karpos.access_token');
      const res = await fetch(`${BASE}/v1/sync/push?since=${lastPulledAt ?? 0}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token ?? ''}` },
        body: JSON.stringify({ changes }),
      });
      if (!res.ok) throw new Error(`push failed ${res.status}`);
      pushed = Object.values(changes).reduce((acc: number, t) => {
        const tbl = t as { created?: unknown[]; updated?: unknown[]; deleted?: unknown[] };
        return acc + (tbl.created?.length ?? 0) + (tbl.updated?.length ?? 0) + (tbl.deleted?.length ?? 0);
      }, 0);
    },
    sendCreatedAsUpdated: true,
  });

  return { pulled, pushed };
}
