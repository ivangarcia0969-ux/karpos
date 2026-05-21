'use client';

import { useEffect, useState } from 'react';
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

type Species = { id: string; code: string; commonNameEs: string };
type Variety = { id: string; name: string };

export function NewPlotButton({
  farmId,
  variant = 'primary',
}: {
  farmId: string;
  variant?: 'primary' | 'secondary';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [species, setSpecies] = useState<Species[]>([]);
  const [varieties, setVarieties] = useState<Variety[]>([]);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [varietyId, setVarietyId] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [areaHa, setAreaHa] = useState('');
  const [treesCount, setTreesCount] = useState('');
  const [spacingRowM, setSpacingRowM] = useState('');
  const [spacingTreeM, setSpacingTreeM] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    getBrowserClient()
      .listSpecies()
      .then(setSpecies)
      .catch(() => setSpecies([]));
  }, [open]);

  useEffect(() => {
    if (!speciesId) {
      setVarieties([]);
      setVarietyId('');
      return;
    }
    getBrowserClient()
      .listVarieties(speciesId)
      .then(setVarieties)
      .catch(() => setVarieties([]));
  }, [speciesId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const sdk = getBrowserClient();
      await sdk.createPlot({
        farmId,
        code,
        name,
        speciesId: speciesId || undefined,
        varietyId: varietyId || undefined,
        plantingDate: plantingDate || undefined,
        areaHa: areaHa ? Number(areaHa) : undefined,
        treesCount: treesCount ? Number(treesCount) : undefined,
        spacingRowM: spacingRowM ? Number(spacingRowM) : undefined,
        spacingTreeM: spacingTreeM ? Number(spacingTreeM) : undefined,
        metadata: notes ? { notes } : {},
      } as never);
      setOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError(
        (e as { payload?: { message?: string } })?.payload?.message ??
          (e as Error).message ??
          'No se pudo crear el lote',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nuevo lote
      </Button>
      <Drawer
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Nuevo lote"
        description="Unidad operativa dentro de la finca: especie, marco, plantación."
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button form="new-plot-form" type="submit" disabled={busy}>
              {busy ? 'Guardando…' : 'Crear lote'}
            </Button>
          </div>
        }
      >
        <form id="new-plot-form" className="grid grid-cols-2 gap-4" onSubmit={onSubmit}>
          <div>
            <Label htmlFor="code">Código *</Label>
            <Input id="code" required maxLength={40} value={code} onChange={(e) => setCode(e.target.value)} placeholder="L-01" />
          </div>
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Hass Sur Alto" />
          </div>
          <div>
            <Label htmlFor="species">Especie</Label>
            <Select id="species" value={speciesId} onChange={(e) => setSpeciesId(e.target.value)}>
              <option value="">— Sin especificar —</option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.commonNameEs} ({s.code})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="variety">Variedad</Label>
            <Select id="variety" value={varietyId} onChange={(e) => setVarietyId(e.target.value)} disabled={!speciesId || varieties.length === 0}>
              <option value="">— Opcional —</option>
              {varieties.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="planting">Fecha de plantación</Label>
            <Input id="planting" type="date" value={plantingDate} onChange={(e) => setPlantingDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="area">Área (ha)</Label>
            <Input id="area" type="number" step="0.001" min="0" value={areaHa} onChange={(e) => setAreaHa(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="trees">N° árboles</Label>
            <Input id="trees" type="number" step="1" min="0" value={treesCount} onChange={(e) => setTreesCount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="row">Marco entre hileras (m)</Label>
            <Input id="row" type="number" step="0.01" min="0" value={spacingRowM} onChange={(e) => setSpacingRowM(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tree">Marco entre árboles (m)</Label>
            <Input id="tree" type="number" step="0.01" min="0" value={spacingTreeM} onChange={(e) => setSpacingTreeM(e.target.value)} />
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
