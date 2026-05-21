'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import type { FitoProduct } from '@karpos/sdk';
import { getBrowserClient } from '@/lib/api-client.client';
import { Drawer, Button, FieldError } from '@karpos/ui';
import { NewFitoButton } from './new-fito-button';

export function FitoActions({ product }: { product: FitoProduct }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setBusy(true);
    setError(null);
    try {
      await getBrowserClient().deleteFitoProduct(product.id);
      setConfirmOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo eliminar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <NewFitoButton
        product={product}
        trigger={
          <span className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" title="Editar">
            <Pencil className="h-3.5 w-3.5" />
          </span>
        }
      />
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="rounded-md p-1.5 text-neutral-500 hover:bg-danger-50 hover:text-danger-700"
        title="Eliminar"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Drawer
        open={confirmOpen}
        onClose={() => !busy && setConfirmOpen(false)}
        title={`Eliminar "${product.commercialName}"`}
        description="El producto se desactiva del catálogo. Las aplicaciones históricas que ya lo referencian no se ven afectadas."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onDelete} disabled={busy}>
              {busy ? 'Eliminando…' : 'Sí, eliminar'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-700">
          Vas a eliminar el producto <strong>{product.commercialName}</strong> ({product.activeIngredient}) del catálogo
          de tu organización. Esta acción se puede revertir contactando soporte.
        </p>
        <FieldError>{error}</FieldError>
      </Drawer>
    </div>
  );
}
