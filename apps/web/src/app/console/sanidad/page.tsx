'use client';

import { useState } from 'react';
import {
  PageHeader, Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, EmptyState,
  Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@karpos/ui';
import { Plus, AlertTriangle, Shield } from 'lucide-react';
import { useScoutings, useRecordScouting, useRecordSpray, useVoidSpray } from '@/hooks/use-health';
import { useAllPlots } from '@/hooks/use-farms';
import type { SprayRecord } from '@karpos/types';

function ScoutingDialog({ open, onClose, plotId }: { open: boolean; onClose: () => void; plotId: string }) {
  const record = useRecordScouting();
  const [form, setForm] = useState({
    observedAt: new Date().toISOString().slice(0, 10),
    pestTaxonId: 'mildiu',
    severityScale: 'ETD',
    severityValue: '2',
    incidencePct: '',
    source: 'manual',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await record.mutateAsync({
      plotId,
      observedAt: new Date(form.observedAt).toISOString(),
      pestTaxonId: form.pestTaxonId,
      severityScale: form.severityScale,
      severityValue: form.severityValue || undefined,
      incidencePct: form.incidencePct || undefined,
      source: form.source,
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Nuevo monitoreo</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="sc-date">Fecha *</Label>
              <Input id="sc-date" type="date" required {...field('observedAt')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sc-pest">Organismo / Enfermedad *</Label>
              <Select id="sc-pest" required {...field('pestTaxonId')}>
                <option value="mildiu">Mildiu (Plasmopara viticola)</option>
                <option value="oidio">Oídio (Erysiphe necator)</option>
                <option value="botrytis">Botrytis (Botrytis cinerea)</option>
                <option value="trips">Trips</option>
                <option value="acaros">Ácaros</option>
                <option value="cochinilla">Cochinilla</option>
                <option value="otro">Otro</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="sc-sev">Severidad (ETD 1-5)</Label>
              <Input id="sc-sev" type="number" min="1" max="5" step="1" {...field('severityValue')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sc-inc">Incidencia (%)</Label>
              <Input id="sc-inc" type="number" min="0" max="100" step="0.5" placeholder="15" {...field('incidencePct')} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={record.isPending}>
            {record.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Registrar
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function SprayDialog({ open, onClose, plotId }: { open: boolean; onClose: () => void; plotId: string }) {
  const record = useRecordSpray();
  const [form, setForm] = useState({
    appliedAt: new Date().toISOString().slice(0, 16),
    applicatorName: '',
    equipment: '',
    areaTreatedHa: '',
    phiDays: '7',
    reiHours: '4',
    notes: '',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const appliedDate = new Date(form.appliedAt);
    const phiDate = new Date(appliedDate.getTime() + Number(form.phiDays) * 86400_000);
    const reiDate = new Date(appliedDate.getTime() + Number(form.reiHours) * 3600_000);
    await record.mutateAsync({
      plotId,
      appliedAt: appliedDate.toISOString(),
      applicatorName: form.applicatorName || undefined,
      equipment: form.equipment || undefined,
      areaTreatedHa: form.areaTreatedHa || undefined,
      phiUntil: phiDate.toISOString(),
      reiUntil: reiDate.toISOString(),
      status: 'applied',
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Registrar aplicación fitosanitaria</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="sp-date">Fecha y hora de aplicación *</Label>
              <Input id="sp-date" type="datetime-local" required {...field('appliedAt')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp-app">Aplicador</Label>
              <Input id="sp-app" placeholder="Nombre del aplicador" {...field('applicatorName')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp-eq">Equipo</Label>
              <Input id="sp-eq" placeholder="Ej. Pulverizador turbina 800L" {...field('equipment')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp-area">Área tratada (ha)</Label>
              <Input id="sp-area" type="number" step="0.01" min="0" placeholder="3.2" {...field('areaTreatedHa')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp-phi">PHI (días de carencia) *</Label>
              <Input id="sp-phi" type="number" min="0" required {...field('phiDays')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="sp-rei">REI (horas reingreso) *</Label>
              <Input id="sp-rei" type="number" min="0" required {...field('reiHours')} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={record.isPending}>
            {record.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Registrar aplicación
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function phiTone(phiUntil: string | null | undefined): 'leaf' | 'clay' | 'bark' {
  if (!phiUntil) return 'leaf';
  return new Date(phiUntil) > new Date() ? 'clay' : 'leaf';
}

export default function SanidadPage() {
  const { data: plots = [], isLoading: plotsLoading } = useAllPlots();
  const [selectedPlot, setSelectedPlot] = useState('');
  const [openScouting, setOpenScouting] = useState(false);
  const [openSpray, setOpenSpray] = useState(false);

  const activePlot = selectedPlot || plots[0]?.id || '';
  const { data: scoutings = [], isLoading: scoutingLoading } = useScoutings(activePlot);

  const activePhi = scoutings
    .filter((s) => s.severityValue && Number(s.severityValue) >= 3)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sanidad+"
        description="Monitoreo, aplicaciones y carencia (PHI/REI)."
        actions={
          activePlot && (
            <>
              <Button variant="outline" onClick={() => setOpenScouting(true)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Nuevo monitoreo
              </Button>
              <Button onClick={() => setOpenSpray(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar aplicación
              </Button>
            </>
          )
        }
      />

      <div className="flex items-center gap-3">
        <Select
          className="max-w-xs"
          value={activePlot}
          onChange={(e) => setSelectedPlot(e.target.value)}
          disabled={plotsLoading}
        >
          {plots.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      {activePhi.length > 0 && (
        <Card className="border-karpos-clay/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-karpos-clay">
              <Shield className="h-4 w-4" /> Alertas de severidad alta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-karpos-fog text-sm">
              {activePhi.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <span className="font-medium capitalize">{s.pestTaxonId}</span>
                  <Badge tone="clay">ETD {s.severityValue} · {new Date(s.observedAt).toLocaleDateString('es-CO')}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {scoutingLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : scoutings.length === 0 ? (
        <EmptyState
          title="Sin registros de monitoreo"
          description="Registra el primer monitoreo fitosanitario para este lote."
          action={activePlot ? <Button onClick={() => setOpenScouting(true)}>Nuevo monitoreo</Button> : undefined}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organismo</TableHead>
              <TableHead>Severidad</TableHead>
              <TableHead>Incidencia</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoutings.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="capitalize font-medium">{s.pestTaxonId}</TableCell>
                <TableCell>
                  {s.severityValue ? (
                    <Badge tone={Number(s.severityValue) >= 3 ? 'clay' : 'leaf'}>
                      ETD {s.severityValue}
                    </Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>{s.incidencePct ? `${s.incidencePct}%` : '—'}</TableCell>
                <TableCell className="capitalize">{s.source}</TableCell>
                <TableCell>{new Date(s.observedAt).toLocaleDateString('es-CO')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {openScouting && activePlot && (
        <ScoutingDialog open={openScouting} onClose={() => setOpenScouting(false)} plotId={activePlot} />
      )}
      {openSpray && activePlot && (
        <SprayDialog open={openSpray} onClose={() => setOpenSpray(false)} plotId={activePlot} />
      )}
    </div>
  );
}
