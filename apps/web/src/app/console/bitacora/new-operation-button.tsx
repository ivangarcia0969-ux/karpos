'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Textarea,
  FieldError,
  FieldHint,
} from '@karpos/ui';
import { Plus } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

const OP_TYPES = [
  ['prune', 'Poda'],
  ['fertilize', 'Fertilización'],
  ['spray', 'Aplicación fitosanitaria'],
  ['irrigate', 'Riego'],
  ['thin', 'Raleo'],
  ['mow', 'Desbroce'],
  ['training', 'Tutorado / formación'],
  ['soil_amendment', 'Enmienda al suelo'],
  ['pest_monitoring', 'Monitoreo'],
  ['manual_log', 'Registro manual'],
  ['other', 'Otro'],
] as const;

type Plot = { id: string; name: string; code: string };

export function NewOperationButton({
  plots,
  variant = 'primary',
}: {
  plots: Plot[];
  variant?: 'primary' | 'secondary';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plotId, setPlotId] = useState(plots[0]?.id ?? '');
  const [operationType, setOperationType] = useState<string>('manual_log');
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [endedAt, setEndedAt] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plotId) {
      setError('Seleccioná un lote');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.logFieldOperation({
        plotId,
        operationType,
        startedAt: new Date(startedAt).toISOString(),
        endedAt: endedAt ? new Date(endedAt).toISOString() : undefined,
        areaHa: areaHa ? Number(areaHa) : undefined,
        notes: notes || undefined,
        inputs: [],
      });
      setOpen(false);
      setNotes('');
      setAreaHa('');
      router.refresh();
    } catch (e: unknown) {
      setError(
        (e as { payload?: { message?: string } })?.payload?.message ??
          (e as Error).message ??
          'No se pudo registrar',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} disabled={plots.length === 0}>
        <Plus className="h-4 w-4" /> Registrar operación
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Registrar operación"
        description="Cualquier labor agronómica con su ventana de tiempo y lote."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-op-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        }
      >
        <form id="new-op-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div className="col-span-2">
            <Label htmlFor="plot">Lote *</Label>
            <Select id="plot" value={plotId} onChange={(e) => setPlotId(e.target.value)} required>
              {plots.length === 0 ? <option value="">— No hay lotes —</option> : null}
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
            {plots.length === 0 ? (
              <FieldHint>Creá un lote en Predios primero.</FieldHint>
            ) : null}
          </div>
          <div className="col-span-2">
            <Label htmlFor="op">Tipo de operación *</Label>
            <Select id="op" value={operationType} onChange={(e) => setOperationType(e.target.value)} required>
              {OP_TYPES.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="start">Inicio *</Label>
            <Input id="start" type="datetime-local" required value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="end">Fin</Label>
            <Input id="end" type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="area">Área (ha)</Label>
            <Input id="area" type="number" step="0.001" min="0" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} />
          </div>
          <div />
          <div className="col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Detalles, condiciones del campo, etc." />
          </div>
          <div className="col-span-2">
            <FieldError>{error}</FieldError>
          </div>
        </form>
      </Drawer>
    </>
  );
}
