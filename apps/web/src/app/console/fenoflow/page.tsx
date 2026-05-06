'use client';

import { useState } from 'react';
import {
  PageHeader, Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Badge, Spinner,
  Dialog, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter,
  Input, Label, Select, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@karpos/ui';
import { Plus, Thermometer, Leaf } from 'lucide-react';
import { usePhenologyEvents, useGdd, useRecordPhenologyEvent } from '@/hooks/use-phenology';
import { useAllPlots } from '@/hooks/use-farms';

const BBCH_LABELS: Record<string, string> = {
  '00': 'Yema dormida', '01': 'Inicio hinchazón', '03': 'Yema hinchada',
  '07': 'Punta verde', '09': 'Apertura', '10': 'Primera hoja',
  '19': 'Hojas desplegadas', '53': 'Botones visibles', '57': 'Botones separados',
  '60': 'Inicio floración', '65': 'Plena floración', '67': 'Fin floración',
  '69': 'Cuajado', '71': 'Frutos pea-size', '73': 'Frutos cherry-size',
  '75': 'Expansión rápida', '77': 'Veraison iniciado', '81': 'Inicio madurez',
  '85': 'Madurez comercial', '89': 'Cosecha completa',
};

function EventDialog({ open, onClose, plotId }: { open: boolean; onClose: () => void; plotId: string }) {
  const record = useRecordPhenologyEvent();
  const [form, setForm] = useState({
    bbchCode: '65',
    observedAt: new Date().toISOString().slice(0, 10),
    observedPct: '',
    source: 'manual',
    notes: '',
  });

  const field = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value })),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await record.mutateAsync({
      plotId,
      bbchCode: form.bbchCode,
      observedAt: new Date(form.observedAt).toISOString(),
      observedPct: form.observedPct || undefined,
      source: form.source,
      notes: form.notes || undefined,
    });
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogHeader>
          <DialogTitle>Registrar estado fenológico</DialogTitle>
          <DialogClose onClick={onClose} />
        </DialogHeader>
        <DialogBody>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="fe-bbch">Código BBCH *</Label>
              <Select id="fe-bbch" required {...field('bbchCode')}>
                {Object.entries(BBCH_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>BBCH {k} — {v}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="fe-date">Fecha observada *</Label>
              <Input id="fe-date" type="date" required {...field('observedAt')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fe-pct">% árboles en estadio</Label>
              <Input id="fe-pct" type="number" min="0" max="100" step="5" placeholder="80" {...field('observedPct')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fe-source">Fuente</Label>
              <Select id="fe-source" {...field('source')}>
                <option value="manual">Manual</option>
                <option value="satellite">Satélite</option>
                <option value="model">Modelo</option>
                <option value="imported">Importado</option>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="fe-notes">Observaciones</Label>
              <Textarea id="fe-notes" placeholder="Descripción del estado observado…" {...field('notes')} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={record.isPending}>
            {record.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Guardar
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function GddSummary({ plotId }: { plotId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const startOfYear = `${today.slice(0, 4)}-01-01`;
  const { data: gdd = [], isLoading } = useGdd(plotId, startOfYear, today);

  const totalGdd = gdd.reduce((sum, d) => sum + (Number(d.cumulative_gdd) || 0), 0);
  const lastCumulative = gdd.at(-1)?.cumulative_gdd ?? '0';

  if (isLoading) return <Spinner className="h-5 w-5" />;

  return (
    <div>
      <p className="font-display text-3xl">{Number(lastCumulative).toFixed(1)}°D</p>
      <p className="text-sm text-karpos-bark/70">Base 10°C · acumulado {today.slice(0, 4)}</p>
    </div>
  );
}

export default function FenoflowPage() {
  const { data: plots = [], isLoading: plotsLoading } = useAllPlots();
  const [selectedPlot, setSelectedPlot] = useState('');
  const [open, setOpen] = useState(false);

  const activePlot = selectedPlot || plots[0]?.id || '';
  const { data: events = [], isLoading: eventsLoading } = usePhenologyEvents(activePlot);
  const latestEvent = events[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fenoflow"
        description="Estados BBCH y grados-día acumulados por lote."
        actions={
          activePlot && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Registrar estado
            </Button>
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

      {plots.length === 0 && !plotsLoading ? (
        <EmptyState title="Sin lotes" description="Crea una finca con lotes antes de registrar fenología." />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Leaf className="h-4 w-4 text-karpos-leaf" />Etapa actual</CardTitle></CardHeader>
              <CardContent>
                {eventsLoading ? <Spinner /> : latestEvent ? (
                  <>
                    <p className="font-display text-3xl text-karpos-leaf">BBCH {latestEvent.bbchCode}</p>
                    <p className="text-sm text-karpos-bark/70 mt-1">
                      {BBCH_LABELS[latestEvent.bbchCode] ?? 'Estadio'} ·{' '}
                      {new Date(latestEvent.observedAt).toLocaleDateString('es-CO')}
                    </p>
                    {latestEvent.observedPct && (
                      <p className="text-sm text-karpos-bark/60">{latestEvent.observedPct}% de árboles</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-karpos-bark/60">Sin registros fenológicos para este lote.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-karpos-clay" />Grados-día acumulados</CardTitle></CardHeader>
              <CardContent>
                {activePlot ? <GddSummary plotId={activePlot} /> : <p className="text-sm text-karpos-bark/60">Selecciona un lote.</p>}
              </CardContent>
            </Card>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
          ) : events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BBCH</TableHead>
                  <TableHead>Estadio</TableHead>
                  <TableHead>% árboles</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell><Badge tone="leaf">BBCH {ev.bbchCode}</Badge></TableCell>
                    <TableCell>{BBCH_LABELS[ev.bbchCode] ?? ev.bbchCode}</TableCell>
                    <TableCell>{ev.observedPct ?? '—'}</TableCell>
                    <TableCell>{new Date(ev.observedAt).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell className="capitalize">{ev.source}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-karpos-bark/70">{ev.notes ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </>
      )}

      {open && activePlot && (
        <EventDialog open={open} onClose={() => setOpen(false)} plotId={activePlot} />
      )}
    </div>
  );
}
