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
import { Calendar } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

type Plot = { id: string; name: string; code: string };

export function NewPlanButton({ plots }: { plots: Plot[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plotId, setPlotId] = useState(plots[0]?.id ?? '');
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear());
  const [expectedStartDate, setExpectedStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [expectedYieldKg, setExpectedYieldKg] = useState('');
  const [expectedYieldKgHa, setExpectedYieldKgHa] = useState('');
  const [forecastMethod, setForecastMethod] = useState('histórico');
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await getBrowserClient().createHarvestPlan({
        plotId,
        seasonYear,
        expectedStartDate: expectedStartDate || undefined,
        expectedEndDate: expectedEndDate || undefined,
        expectedYieldKg: expectedYieldKg ? Number(expectedYieldKg) : undefined,
        expectedYieldKgHa: expectedYieldKgHa ? Number(expectedYieldKgHa) : undefined,
        forecastMethod: forecastMethod || undefined,
        forecastMetadata: {},
        notes: notes || undefined,
      });
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string } })?.payload?.message ?? 'No se pudo crear el plan');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} disabled={plots.length === 0}>
        <Calendar className="h-4 w-4" /> Plan de temporada
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Crear plan de cosecha"
        description="Forecast por lote y temporada para planificar logística."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-plan-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Crear plan'}
            </Button>
          </div>
        }
      >
        <form id="new-plan-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
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
            <Label htmlFor="year">Temporada *</Label>
            <Input id="year" type="number" min="2000" max="2200" required value={seasonYear} onChange={(e) => setSeasonYear(Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="method">Método</Label>
            <Input id="method" value={forecastMethod} onChange={(e) => setForecastMethod(e.target.value)} placeholder="histórico, sat, ML" />
          </div>
          <div>
            <Label htmlFor="start">Inicio esperado</Label>
            <Input id="start" type="date" value={expectedStartDate} onChange={(e) => setExpectedStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="end">Fin esperado</Label>
            <Input id="end" type="date" value={expectedEndDate} onChange={(e) => setExpectedEndDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="kg">Rendimiento (kg)</Label>
            <Input id="kg" type="number" step="0.01" min="0" value={expectedYieldKg} onChange={(e) => setExpectedYieldKg(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="kgha">Rendimiento (kg/ha)</Label>
            <Input id="kgha" type="number" step="0.01" min="0" value={expectedYieldKgHa} onChange={(e) => setExpectedYieldKgHa(e.target.value)} />
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
