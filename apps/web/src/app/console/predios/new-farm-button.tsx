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

const COUNTRIES = [
  ['CO', 'Colombia'],
  ['AR', 'Argentina'],
  ['CL', 'Chile'],
  ['MX', 'México'],
  ['PE', 'Perú'],
  ['EC', 'Ecuador'],
  ['BR', 'Brasil'],
  ['ES', 'España'],
  ['US', 'Estados Unidos'],
] as const;

export function NewFarmButton({
  variant = 'primary',
}: { variant?: 'primary' | 'secondary' }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('CO');
  const [region, setRegion] = useState('');
  const [locality, setLocality] = useState('');
  const [totalAreaHa, setTotalAreaHa] = useState('');
  const [elevationM, setElevationM] = useState('');
  const [timezone, setTimezone] = useState('America/Bogota');
  const [notes, setNotes] = useState('');

  function reset() {
    setCode('');
    setName('');
    setRegion('');
    setLocality('');
    setTotalAreaHa('');
    setElevationM('');
    setNotes('');
    setError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.createFarm({
        code,
        name,
        countryCode,
        region: region || undefined,
        locality: locality || undefined,
        timezone,
        totalAreaHa: totalAreaHa ? Number(totalAreaHa) : undefined,
        elevationM: elevationM ? Number(elevationM) : undefined,
        metadata: notes ? { notes } : {},
      } as never);
      setOpen(false);
      reset();
      router.refresh();
    } catch (e: unknown) {
      setError((e as { payload?: { message?: string }; message?: string })?.payload?.message ?? (e as Error).message ?? 'No se pudo crear la finca');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nueva finca
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Nueva finca"
        description="Información básica del predio. Después podés agregar lotes adentro."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-farm-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Crear finca'}
            </Button>
          </div>
        }
      >
        <form id="new-farm-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="code">Código *</Label>
            <Input id="code" required maxLength={40} value={code} onChange={(e) => setCode(e.target.value)} placeholder="FNC-001" />
            <FieldHint>Identificador interno único.</FieldHint>
          </div>
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Hacienda La Esperanza" />
          </div>
          <div>
            <Label htmlFor="country">País *</Label>
            <Select id="country" value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
              {COUNTRIES.map(([code, name]) => (
                <option key={code} value={code}>
                  {code} — {name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">Zona horaria *</Label>
            <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="region">Región</Label>
            <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Valle del Cauca" />
          </div>
          <div>
            <Label htmlFor="locality">Localidad</Label>
            <Input id="locality" value={locality} onChange={(e) => setLocality(e.target.value)} placeholder="La Unión" />
          </div>
          <div>
            <Label htmlFor="area">Área total (ha)</Label>
            <Input id="area" type="number" step="0.001" min="0" value={totalAreaHa} onChange={(e) => setTotalAreaHa(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="elev">Elevación (m)</Label>
            <Input id="elev" type="number" step="1" min="0" value={elevationM} onChange={(e) => setElevationM(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="col-span-2">
            <FieldError>{error}</FieldError>
          </div>
        </form>
      </Drawer>
    </>
  );
}
