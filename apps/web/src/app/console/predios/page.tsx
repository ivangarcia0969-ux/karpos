'use client';

import { useState } from 'react';
import {
  PageHeader, Button, Card, CardContent, EmptyState, Badge,
  Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter,
  Input, Label, Select, Spinner,
} from '@karpos/ui';
import { Plus, MapPin, Layers } from 'lucide-react';
import { useFarms, useCreateFarm } from '@/hooks/use-farms';

const TIMEZONES = [
  'America/Bogota', 'America/Lima', 'America/Santiago', 'America/Argentina/Buenos_Aires',
  'America/Mexico_City', 'America/Caracas', 'America/La_Paz',
];

function FarmDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const create = useCreateFarm();
  const [form, setForm] = useState({
    code: '', name: '', countryCode: 'CO', region: '', locality: '',
    timezone: 'America/Bogota', totalAreaHa: '', elevationM: '',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      code: form.code,
      name: form.name,
      countryCode: form.countryCode,
      region: form.region || undefined,
      locality: form.locality || undefined,
      timezone: form.timezone,
      totalAreaHa: form.totalAreaHa ? Number(form.totalAreaHa) : undefined,
      elevationM: form.elevationM ? Number(form.elevationM) : undefined,
      contact: {},
      metadata: {},
    });
    onClose();
    setForm({ code: '', name: '', countryCode: 'CO', region: '', locality: '', timezone: 'America/Bogota', totalAreaHa: '', elevationM: '' });
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Nueva finca</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="df-code">Código *</Label>
              <Input id="df-code" placeholder="FCA-001" required {...field('code')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-name">Nombre *</Label>
              <Input id="df-name" placeholder="Finca El Rosal" required {...field('name')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-country">País *</Label>
              <Select id="df-country" required {...field('countryCode')}>
                <option value="CO">Colombia</option>
                <option value="PE">Perú</option>
                <option value="CL">Chile</option>
                <option value="AR">Argentina</option>
                <option value="MX">México</option>
                <option value="EC">Ecuador</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-tz">Zona horaria *</Label>
              <Select id="df-tz" required {...field('timezone')}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-region">Región / Departamento</Label>
              <Input id="df-region" placeholder="Valle del Cauca" {...field('region')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-locality">Municipio</Label>
              <Input id="df-locality" placeholder="Palmira" {...field('locality')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-area">Área total (ha)</Label>
              <Input id="df-area" type="number" step="0.1" min="0" placeholder="45.5" {...field('totalAreaHa')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="df-elev">Elevación (m.s.n.m.)</Label>
              <Input id="df-elev" type="number" min="0" placeholder="1200" {...field('elevationM')} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
            Crear finca
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

export default function PrediosPage() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useFarms();
  const farms = data?.rows ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predios"
        description="Fincas, sectores y lotes geo-referenciados."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva finca
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spinner className="h-8 w-8" />
        </div>
      ) : farms.length === 0 ? (
        <EmptyState
          title="Aún no hay fincas"
          description="Crea la primera finca para empezar a registrar lotes y árboles."
          action={<Button onClick={() => setOpen(true)}>Crear finca</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((f) => (
            <Card key={f.id} className="hover:border-karpos-leaf/30 transition-colors cursor-pointer">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg leading-tight">{f.name}</h3>
                  <Badge tone="leaf">{f.code}</Badge>
                </div>
                {(f.region || f.locality) && (
                  <div className="flex items-center gap-1.5 text-sm text-karpos-bark/70">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{[f.locality, f.region, f.countryCode].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {f.totalAreaHa && (
                  <div className="flex items-center gap-1.5 text-sm text-karpos-bark/70">
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    <span>{f.totalAreaHa} ha</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <FarmDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
