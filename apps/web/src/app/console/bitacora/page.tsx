'use client';

import { useState } from 'react';
import {
  PageHeader, Button, EmptyState, Badge, Spinner,
  Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@karpos/ui';
import { Plus, CalendarDays, User, Layers } from 'lucide-react';
import { useFieldOperations, useLogFieldOperation } from '@/hooks/use-field-ops';
import { useAllPlots } from '@/hooks/use-farms';
import type { FieldOperation } from '@karpos/types';

const OPERATION_TYPES: Record<string, string> = {
  poda: 'Poda',
  raleo: 'Raleo de frutos',
  riego: 'Riego',
  fertilizacion: 'Fertilización',
  cosecha: 'Cosecha',
  monitoreo: 'Monitoreo',
  amarre: 'Amarre / Desbrote',
  otro: 'Otro',
};

function LaborDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: plots = [] } = useAllPlots();
  const log = useLogFieldOperation();
  const [form, setForm] = useState({
    plotId: '',
    operationTypeId: 'poda',
    performedAt: new Date().toISOString().slice(0, 16),
    workersCount: '',
    areaCoveredHa: '',
    outputQuantity: '',
    outputUnit: 'kg',
    notes: '',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await log.mutateAsync({
      plotId: form.plotId,
      operationTypeId: form.operationTypeId,
      performedAt: new Date(form.performedAt).toISOString(),
      workersCount: form.workersCount ? Number(form.workersCount) : undefined,
      areaCoveredHa: form.areaCoveredHa || undefined,
      outputQuantity: form.outputQuantity || undefined,
      outputUnit: form.outputQuantity ? form.outputUnit : undefined,
      notes: form.notes || undefined,
      attachments: [],
      metadata: {},
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Registrar labor</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="lb-plot">Lote *</Label>
              <Select id="lb-plot" required {...field('plotId')}>
                <option value="">— seleccione —</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-type">Tipo de labor *</Label>
              <Select id="lb-type" required {...field('operationTypeId')}>
                {Object.entries(OPERATION_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-date">Fecha y hora *</Label>
              <Input id="lb-date" type="datetime-local" required {...field('performedAt')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-workers">Trabajadores</Label>
              <Input id="lb-workers" type="number" min="0" placeholder="6" {...field('workersCount')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-area">Área cubierta (ha)</Label>
              <Input id="lb-area" type="number" step="0.01" min="0" placeholder="2.5" {...field('areaCoveredHa')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-qty">Producción / Cantidad</Label>
              <Input id="lb-qty" type="number" step="0.1" min="0" placeholder="1200" {...field('outputQuantity')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lb-unit">Unidad</Label>
              <Select id="lb-unit" {...field('outputUnit')}>
                <option value="kg">kg</option>
                <option value="t">toneladas</option>
                <option value="cajas">cajas</option>
                <option value="plantas">plantas</option>
                <option value="jornal">jornales</option>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="lb-notes">Observaciones</Label>
              <Textarea id="lb-notes" placeholder="Detalles de la labor…" {...field('notes')} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={log.isPending}>
            {log.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Registrar
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function OperationRow({ op }: { op: FieldOperation }) {
  return (
    <TableRow>
      <TableCell>
        <Badge tone="leaf">{OPERATION_TYPES[op.operationTypeId] ?? op.operationTypeId}</Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-xs text-karpos-bark/70">
          <CalendarDays className="h-3 w-3" />
          {formatDate(op.performedAt)}
        </div>
      </TableCell>
      <TableCell>
        {op.workersCount != null && (
          <div className="flex items-center gap-1 text-sm">
            <User className="h-3.5 w-3.5 text-karpos-bark/50" />
            {op.workersCount}
          </div>
        )}
      </TableCell>
      <TableCell>
        {op.areaCoveredHa && (
          <div className="flex items-center gap-1 text-sm">
            <Layers className="h-3.5 w-3.5 text-karpos-bark/50" />
            {op.areaCoveredHa} ha
          </div>
        )}
      </TableCell>
      <TableCell>
        {op.outputQuantity
          ? `${op.outputQuantity} ${op.outputUnit ?? ''}`
          : <span className="text-karpos-bark/40">—</span>}
      </TableCell>
      <TableCell className="max-w-xs truncate text-karpos-bark/70 text-xs">
        {op.notes ?? '—'}
      </TableCell>
    </TableRow>
  );
}

export default function BitacoraPage() {
  const [open, setOpen] = useState(false);
  const [plotFilter, setPlotFilter] = useState('');
  const { data: plots = [] } = useAllPlots();
  const { data: ops = [], isLoading } = useFieldOperations({ plotId: plotFilter || undefined, pageSize: 100 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora Verde"
        description="Registro de labores culturales por lote y cuadrilla."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Registrar labor
          </Button>
        }
      />

      <div className="flex items-center gap-3">
        <Select
          className="max-w-xs"
          value={plotFilter}
          onChange={(e) => setPlotFilter(e.target.value)}
        >
          <option value="">Todos los lotes</option>
          {plots.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : ops.length === 0 ? (
        <EmptyState
          title="Sin labores registradas"
          description="Cada labor — poda, raleo, riego, cosecha — se registra aquí con tiempo, área y rendimiento."
          action={<Button onClick={() => setOpen(true)}>Registrar labor</Button>}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Labor</TableHead>
              <TableHead>Fecha / Hora</TableHead>
              <TableHead>Trabajadores</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Producción</TableHead>
              <TableHead>Notas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ops.map((op) => <OperationRow key={op.id} op={op} />)}
          </TableBody>
        </Table>
      )}

      <LaborDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
