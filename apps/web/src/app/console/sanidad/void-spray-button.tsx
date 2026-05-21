'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Drawer, Textarea, Label, FieldError } from '@karpos/ui';
import { X } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

export function VoidSprayButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await getBrowserClient().voidSpray(id, reason);
      setOpen(false);
      setReason('');
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo anular');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-danger-50 hover:text-danger-700"
        title="Anular aplicación"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Anular aplicación"
        description="La fila queda en la base como histórico. No se borra (cumple GLOBALG.A.P.)."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="void-form" variant="danger" type="submit" disabled={busy || reason.trim().length < 3}>
              {busy ? 'Anulando…' : 'Anular registro'}
            </Button>
          </div>
        }
      >
        <form id="void-form" onSubmit={onSubmit}>
          <Label htmlFor="reason">Razón de anulación *</Label>
          <Textarea
            id="reason"
            required
            minLength={3}
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ej.: error de digitación, producto vencido, etc."
          />
          <FieldError>{error}</FieldError>
        </form>
      </Drawer>
    </>
  );
}
