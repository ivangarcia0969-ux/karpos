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
import { Beaker } from 'lucide-react';
import { getBrowserClient } from '@/lib/api-client.client';

type Plot = { id: string; name: string; code: string };

const DOSE_UNITS = ['L/ha', 'mL/ha', 'kg/ha', 'g/ha', 'mL/100L', 'g/100L'] as const;

export function NewSprayButton({
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
  const [appliedAt, setAppliedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [operator, setOperator] = useState('');
  const [target, setTarget] = useState('');
  const [productName, setProductName] = useState('');
  const [activeIngredient, setActiveIngredient] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState<string>('L/ha');
  const [waterLPerHa, setWaterLPerHa] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [phiDays, setPhiDays] = useState('14');
  const [reiHours, setReiHours] = useState('');
  const [equipment, setEquipment] = useState('');
  const [windKmh, setWindKmh] = useState('');
  const [tempC, setTempC] = useState('');
  const [rhPct, setRhPct] = useState('');
  const [notes, setNotes] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.recordSpray({
        plotId,
        appliedAt: new Date(appliedAt).toISOString(),
        operator,
        target: target || undefined,
        productName,
        activeIngredient,
        registrationNo: registrationNo || undefined,
        doseAmount: Number(doseAmount),
        doseUnit,
        waterLPerHa: waterLPerHa ? Number(waterLPerHa) : undefined,
        areaHa: Number(areaHa),
        phiDays: Number(phiDays),
        reiHours: reiHours ? Number(reiHours) : undefined,
        equipment: equipment || undefined,
        windKmh: windKmh ? Number(windKmh) : undefined,
        tempC: tempC ? Number(tempC) : undefined,
        rhPct: rhPct ? Number(rhPct) : undefined,
        notes: notes || undefined,
      });
      setOpen(false);
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
        <Beaker className="h-4 w-4" /> Aplicación
      </Button>
      <Drawer
        size="lg"
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Registrar aplicación fitosanitaria"
        description="Append-only · cumple GLOBALG.A.P. IFA v6 CB 7.6. Para anular usá el botón de cada fila."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-spray-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Registrar aplicación'}
            </Button>
          </div>
        }
      >
        <form id="new-spray-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
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
            <Label htmlFor="when">Aplicado *</Label>
            <Input id="when" type="datetime-local" required value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="op">Operario *</Label>
            <Input id="op" required value={operator} onChange={(e) => setOperator(e.target.value)} />
          </div>
          <div className="col-span-2 border-t border-neutral-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Producto</h3>
          </div>
          <div>
            <Label htmlFor="product">Nombre comercial *</Label>
            <Input id="product" required value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ai">Ingrediente activo *</Label>
            <Input id="ai" required value={activeIngredient} onChange={(e) => setActiveIngredient(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="reg">N° registro (ICA / SAG)</Label>
            <Input id="reg" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="target">Objetivo</Label>
            <Input id="target" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Botrytis cinerea" />
          </div>
          <div className="col-span-2 border-t border-neutral-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Dosis y aplicación</h3>
          </div>
          <div>
            <Label htmlFor="dose">Dosis *</Label>
            <Input id="dose" required type="number" step="0.0001" min="0" value={doseAmount} onChange={(e) => setDoseAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="unit">Unidad *</Label>
            <Select id="unit" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)} required>
              {DOSE_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="area">Área aplicada (ha) *</Label>
            <Input id="area" required type="number" step="0.001" min="0" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="water">Agua (L/ha)</Label>
            <Input id="water" type="number" step="0.1" min="0" value={waterLPerHa} onChange={(e) => setWaterLPerHa(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="phi">PHI (días) *</Label>
            <Input id="phi" required type="number" step="1" min="0" value={phiDays} onChange={(e) => setPhiDays(e.target.value)} />
            <FieldHint>Intervalo pre-cosecha de la etiqueta.</FieldHint>
          </div>
          <div>
            <Label htmlFor="rei">REI (horas)</Label>
            <Input id="rei" type="number" step="1" min="0" value={reiHours} onChange={(e) => setReiHours(e.target.value)} />
            <FieldHint>Intervalo de reingreso.</FieldHint>
          </div>
          <div className="col-span-2 border-t border-neutral-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Condiciones (opcional)</h3>
          </div>
          <div>
            <Label htmlFor="equip">Equipo</Label>
            <Input id="equip" value={equipment} onChange={(e) => setEquipment(e.target.value)} placeholder="Pulverizadora hidroneumática" />
          </div>
          <div>
            <Label htmlFor="wind">Viento (km/h)</Label>
            <Input id="wind" type="number" step="0.1" min="0" value={windKmh} onChange={(e) => setWindKmh(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tempc">Temperatura (°C)</Label>
            <Input id="tempc" type="number" step="0.1" value={tempC} onChange={(e) => setTempC(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rh">HR (%)</Label>
            <Input id="rh" type="number" step="0.1" min="0" max="100" value={rhPct} onChange={(e) => setRhPct(e.target.value)} />
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
