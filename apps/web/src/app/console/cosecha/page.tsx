'use client';

import { useState } from 'react';
import {
  PageHeader, Button, Card, CardContent, CardHeader, CardTitle, Badge, Spinner, EmptyState,
  Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter,
  Input, Label, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@karpos/ui';
import { Plus, Scale, TrendingUp } from 'lucide-react';
import { useHarvestPlans, useCreateHarvestPlan, useRecordHarvestLot, useRecordWeighbridgeTicket } from '@/hooks/use-harvest';
import { useAllPlots } from '@/hooks/use-farms';
import type { HarvestPlan } from '@karpos/types';

function PlanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: plots = [] } = useAllPlots();
  const create = useCreateHarvestPlan();
  const year = new Date().getFullYear();
  const [form, setForm] = useState({
    plotId: '',
    seasonYear: String(year),
    expectedYieldKg: '',
    status: 'draft',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      plotId: form.plotId,
      seasonYear: Number(form.seasonYear),
      expectedYieldKg: form.expectedYieldKg || undefined,
      status: form.status,
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Nuevo plan de cosecha</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="pl-plot">Lote *</Label>
              <Select id="pl-plot" required {...field('plotId')}>
                <option value="">— seleccione —</option>
                {plots.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pl-year">Temporada *</Label>
              <Input id="pl-year" type="number" min="2020" max="2035" required {...field('seasonYear')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pl-yield">Rendimiento esperado (kg)</Label>
              <Input id="pl-yield" type="number" min="0" step="100" placeholder="25000" {...field('expectedYieldKg')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="pl-status">Estado</Label>
              <Select id="pl-status" {...field('status')}>
                <option value="draft">Borrador</option>
                <option value="approved">Aprobado</option>
                <option value="active">Activo</option>
              </Select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Crear plan
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function LotDialog({ open, onClose, planId, plotId }: { open: boolean; onClose: () => void; planId: string; plotId: string }) {
  const record = useRecordHarvestLot();
  const [form, setForm] = useState({
    lotCode: `L-${Date.now().toString(36).toUpperCase()}`,
    harvestedOn: new Date().toISOString().slice(0, 10),
    grossKg: '',
    tareKg: '0',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const gross = Number(form.grossKg);
    const tare = Number(form.tareKg);
    await record.mutateAsync({
      plotId,
      planId,
      lotCode: form.lotCode,
      harvestedOn: form.harvestedOn,
      grossKg: form.grossKg,
      tareKg: form.tareKg,
      netKg: String(gross - tare),
      status: 'open',
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Abrir lote de cosecha</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="lt-code">Código lote *</Label>
              <Input id="lt-code" required {...field('lotCode')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lt-date">Fecha cosecha *</Label>
              <Input id="lt-date" type="date" required {...field('harvestedOn')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lt-gross">Peso bruto (kg) *</Label>
              <Input id="lt-gross" type="number" step="0.1" min="0" required {...field('grossKg')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lt-tare">Tara (kg)</Label>
              <Input id="lt-tare" type="number" step="0.1" min="0" {...field('tareKg')} />
            </div>
          </div>
          {form.grossKg && (
            <p className="mt-3 text-sm font-medium text-karpos-leaf">
              Neto: {(Number(form.grossKg) - Number(form.tareKg)).toFixed(1)} kg
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={record.isPending}>
            {record.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Registrar lote
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function statusBadge(status: HarvestPlan['status']) {
  const map: Record<HarvestPlan['status'], 'leaf' | 'clay' | 'bark'> = {
    draft: 'bark', approved: 'leaf', active: 'leaf', closed: 'bark',
  };
  const labels: Record<HarvestPlan['status'], string> = {
    draft: 'Borrador', approved: 'Aprobado', active: 'Activo', closed: 'Cerrado',
  };
  return <Badge tone={map[status]}>{labels[status]}</Badge>;
}

export default function CosechaPage() {
  const year = new Date().getFullYear();
  const { data: plans = [], isLoading } = useHarvestPlans(year);
  const [openPlan, setOpenPlan] = useState(false);
  const [openLot, setOpenLot] = useState<{ planId: string; plotId: string } | null>(null);
  const { data: plots = [] } = useAllPlots();

  const totalKg = plans
    .filter((p) => p.status === 'active' || p.status === 'approved')
    .reduce((s, p) => s + (Number(p.expectedYieldKg) || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cosecha360"
        description="Plan, pesajes y trazabilidad lote a pallet."
        actions={
          <Button onClick={() => setOpenPlan(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo plan
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Scale className="h-4 w-4" />Planes activos</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-karpos-leaf">
              {isLoading ? <Spinner /> : plans.filter((p) => p.status === 'active').length}
            </p>
            <p className="text-sm text-karpos-bark/60">temporada {year}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" />Rendimiento esperado</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-4xl">
              {isLoading ? <Spinner /> : totalKg ? `${(totalKg / 1000).toFixed(1)} t` : '—'}
            </p>
            <p className="text-sm text-karpos-bark/60">planes activos y aprobados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total planes</CardTitle></CardHeader>
          <CardContent>
            <p className="font-display text-4xl">
              {isLoading ? <Spinner /> : plans.length}
            </p>
            <p className="text-sm text-karpos-bark/60">lotes planificados</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner className="h-8 w-8" /></div>
      ) : plans.length === 0 ? (
        <EmptyState
          title="Sin planes de cosecha"
          description="Crea el primer plan de cosecha para la temporada actual."
          action={<Button onClick={() => setOpenPlan(true)}>Nuevo plan</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Temporada</TableHead>
              <TableHead>Rendimiento esperado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => {
              const plot = plots.find((p) => p.id === plan.plotId);
              return (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plot?.name ?? plan.plotId.slice(0, 8)}</TableCell>
                  <TableCell>{plan.seasonYear}</TableCell>
                  <TableCell>
                    {plan.expectedYieldKg ? `${Number(plan.expectedYieldKg).toLocaleString('es-CO')} kg` : '—'}
                  </TableCell>
                  <TableCell>{statusBadge(plan.status)}</TableCell>
                  <TableCell>
                    {(plan.status === 'active' || plan.status === 'approved') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOpenLot({ planId: plan.id, plotId: plan.plotId })}
                      >
                        + Lote
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <PlanDialog open={openPlan} onClose={() => setOpenPlan(false)} />
      {openLot && (
        <LotDialog
          open
          onClose={() => setOpenLot(null)}
          planId={openLot.planId}
          plotId={openLot.plotId}
        />
      )}
    </div>
  );
}
