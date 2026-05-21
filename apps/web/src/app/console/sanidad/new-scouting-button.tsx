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
} from '@karpos/ui';
import { Search } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

type Plot = { id: string; name: string; code: string };

export function NewScoutingButton({ plots }: { plots: Plot[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plotId, setPlotId] = useState(plots[0]?.id ?? '');
  const [observedOn, setObservedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState<'pest' | 'disease' | 'weed' | 'beneficial' | 'abiotic'>('pest');
  const [severity, setSeverity] = useState<'none' | 'low' | 'moderate' | 'high' | 'severe'>('low');
  const [incidencePct, setIncidencePct] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.recordScouting({
        plotId,
        observedOn,
        target,
        category,
        severity,
        incidencePct: incidencePct ? Number(incidencePct) : undefined,
        sampleSize: sampleSize ? Number(sampleSize) : undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      setTarget('');
      setIncidencePct('');
      setSampleSize('');
      setNotes('');
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo registrar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} disabled={plots.length === 0}>
        <Search className="h-4 w-4" /> Monitoreo
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Registrar monitoreo"
        description="Observación de plaga, enfermedad, maleza o problema abiótico."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-scouting-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Registrar'}
            </Button>
          </div>
        }
      >
        <form id="new-scouting-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
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
            <Label htmlFor="obs">Fecha *</Label>
            <Input id="obs" type="date" required value={observedOn} onChange={(e) => setObservedOn(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="category">Categoría *</Label>
            <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as never)} required>
              <option value="pest">Plaga</option>
              <option value="disease">Enfermedad</option>
              <option value="weed">Maleza</option>
              <option value="beneficial">Benéfico</option>
              <option value="abiotic">Abiótico</option>
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="target">Objetivo (especie/nombre) *</Label>
            <Input id="target" required value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Spodoptera frugiperda" />
          </div>
          <div>
            <Label htmlFor="severity">Severidad *</Label>
            <Select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value as never)} required>
              <option value="none">Nula</option>
              <option value="low">Baja</option>
              <option value="moderate">Moderada</option>
              <option value="high">Alta</option>
              <option value="severe">Severa</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="incidence">Incidencia %</Label>
            <Input id="incidence" type="number" step="0.1" min="0" max="100" value={incidencePct} onChange={(e) => setIncidencePct(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="sample">Tamaño de muestra</Label>
            <Input id="sample" type="number" step="1" min="0" value={sampleSize} onChange={(e) => setSampleSize(e.target.value)} placeholder="20 plantas" />
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
