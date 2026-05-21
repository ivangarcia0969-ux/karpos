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

const BBCH_PRESETS = [
  ['00', 'Brotación: yemas en reposo'],
  ['09', 'Brotación: brotes emergiendo'],
  ['15', 'Desarrollo de hojas'],
  ['51', 'Yemas florales hinchadas'],
  ['55', 'Yema floral visible'],
  ['65', 'Plena floración'],
  ['67', 'Caída de pétalos'],
  ['69', 'Fin de floración'],
  ['71', 'Cuajado de frutos'],
  ['75', 'Fruto a mitad de tamaño'],
  ['81', 'Inicio de maduración'],
  ['85', 'Maduración avanzada'],
  ['89', 'Madurez de cosecha'],
  ['91', 'Post-cosecha'],
  ['97', 'Hojas en senescencia'],
] as const;

type Plot = { id: string; name: string; code: string };

export function NewEventButton({
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
  const [observedOn, setObservedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [bbchCode, setBbchCode] = useState('65');
  const [pctInStage, setPctInStage] = useState('');
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
      const stageLabel = BBCH_PRESETS.find(([c]) => c === bbchCode)?.[1];
      const sdk = getBrowserClient();
      await sdk.recordPhenologyEvent({
        plotId,
        observedOn,
        bbchCode,
        stageLabel,
        pctInStage: pctInStage ? Number(pctInStage) : undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      setNotes('');
      setPctInStage('');
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
        <Plus className="h-4 w-4" /> Registrar evento BBCH
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Nuevo evento fenológico"
        description="Escala BBCH (Meier 2001). Útil para sincronizar ventanas de manejo."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-event-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        }
      >
        <form id="new-event-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div className="col-span-2">
            <Label htmlFor="plot">Lote *</Label>
            <Select id="plot" value={plotId} onChange={(e) => setPlotId(e.target.value)} required>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="obs">Fecha de observación *</Label>
            <Input id="obs" type="date" required value={observedOn} onChange={(e) => setObservedOn(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pct">% en etapa</Label>
            <Input id="pct" type="number" step="0.1" min="0" max="100" value={pctInStage} onChange={(e) => setPctInStage(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="bbch">Código BBCH *</Label>
            <Select id="bbch" value={bbchCode} onChange={(e) => setBbchCode(e.target.value)} required>
              {BBCH_PRESETS.map(([c, l]) => (
                <option key={c} value={c}>
                  {c} — {l}
                </option>
              ))}
            </Select>
            <FieldHint>Códigos según Meier 2001 (escala universal).</FieldHint>
          </div>
          <div className="col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="col-span-2">
            <FieldError>{error}</FieldError>
          </div>
        </form>
      </Drawer>
    </>
  );
}
