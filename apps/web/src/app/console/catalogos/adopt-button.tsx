'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

export function AdoptButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onAdopt() {
    if (busy) return;
    setBusy(true);
    try {
      await getBrowserClient().cloneFitoProduct(id);
      router.refresh();
    } catch (e: unknown) {
      const msg = (e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo adoptar';
      alert(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onAdopt}
      disabled={busy}
      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
      title={`Adoptar "${name}" al catálogo de tu organización`}
    >
      <Copy className="h-3 w-3" />
      {busy ? 'Adoptando…' : 'Adoptar'}
    </button>
  );
}
