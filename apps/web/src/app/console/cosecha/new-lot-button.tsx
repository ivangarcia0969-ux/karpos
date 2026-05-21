'use client';

import { useMemo, useState } from 'react';
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
import { Scale } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

type Plot = { id: string; name: string; code: string };
type Plan = { id: string; plotId: string; seasonYear: number };

const QUALITY_GRADES = ['Premium', 'Primera', 'Segunda', 'Industria', 'Rechazo'] as const;

export function NewLotButton({
  plots,
  plans,
  variant = 'primary',
}: {
  plots: Plot[];
  plans: Plan[];
  variant?: 'primary' | 'secondary';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plotId, setPlotId] = useState(plots[0]?.id ?? '');
  const [planId, setPlanId] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [harvestedOn, setHarvestedOn] = useState(() => new Date().toISOString().slice(0, 10));
  const [grossKg, setGrossKg] = useState('');
  const [tareKg, setTareKg] = useState('0');
  const [containersCount, setContainersCount] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Primera');
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');

  const netKg = useMemo(() => {
    const g = Number(grossKg) || 0;
    const t = Number(tareKg) || 0;
    return g - t;
  }, [grossKg, tareKg]);

  const eligiblePlans = useMemo(() => plans.filter((p) => p.plotId === plotId), [plans, plotId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await getBrowserClient().recordHarvestLot({
        plotId,
        planId: planId || undefined,
        lotCode,
        harvestedOn,
        grossKg: grossKg ? Number(grossKg) : undefined,
        tareKg: Number(tareKg),
        netWeightKg: netKg > 0 ? netKg : undefined,
        containersCount: containersCount ? Number(containersCount) : undefined,
        qualityGrade: qualityGrade || undefined,
        destination: destination || undefined,
        notes: notes || undefined,
      });
      setOpen(false);
      setLotCode('');
      setGrossKg('');
      setContainersCount('');
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
      <Button variant={variant} onClick={() => setOpen(true)} disabled={plots.length === 0}>
        <Scale className="h-4 w-4" /> Registrar lote
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Registrar lote cosechado"
        description="Pesaje bruto + tara y destino comercial. Genera trazabilidad por QR."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-lot-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Registrar lote'}
            </Button>
          </div>
        }
      >
        <form id="new-lot-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div className="col-span-2">
            <Label htmlFor="plot">Lote de campo *</Label>
            <Select id="plot" value={plotId} onChange={(e) => setPlotId(e.target.value)} required>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>
          {eligiblePlans.length > 0 ? (
            <div className="col-span-2">
              <Label htmlFor="plan">Plan de temporada</Label>
              <Select id="plan" value={planId} onChange={(e) => setPlanId(e.target.value)}>
                <option value="">— Sin asociar a un plan —</option>
                {eligiblePlans.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    Temporada {pl.seasonYear}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}
          <div>
            <Label htmlFor="code">Código de lote *</Label>
            <Input id="code" required value={lotCode} onChange={(e) => setLotCode(e.target.value)} placeholder="LOT-2026-001" />
          </div>
          <div>
            <Label htmlFor="on">Fecha de cosecha *</Label>
            <Input id="on" type="date" required value={harvestedOn} onChange={(e) => setHarvestedOn(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="gross">Peso bruto (kg) *</Label>
            <Input id="gross" type="number" step="0.01" min="0" required value={grossKg} onChange={(e) => setGrossKg(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tare">Tara (kg)</Label>
            <Input id="tare" type="number" step="0.01" min="0" value={tareKg} onChange={(e) => setTareKg(e.target.value)} />
            <FieldHint>Neto calculado: <strong className="tabular-nums">{netKg.toFixed(2)} kg</strong></FieldHint>
          </div>
          <div>
            <Label htmlFor="cont">N° envases</Label>
            <Input id="cont" type="number" step="1" min="0" value={containersCount} onChange={(e) => setContainersCount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="quality">Calidad</Label>
            <Select id="quality" value={qualityGrade} onChange={(e) => setQualityGrade(e.target.value)}>
              {QUALITY_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>
          <div className="col-span-2">
            <Label htmlFor="dest">Destino</Label>
            <Input id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Empacadora X, Mercado Mayorista, Exportación" />
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
