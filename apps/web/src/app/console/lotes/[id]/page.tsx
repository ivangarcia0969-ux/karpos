import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  PageHeader,
  Card,
  CardContent,
  Badge,
  EmptyState,
} from '@karpos/ui';
import {
  ChevronLeft,
  Sprout,
  ClipboardList,
  Bug,
  Wheat,
  Beaker,
  AlertTriangle,
} from 'lucide-react';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

const OP_LABEL: Record<string, string> = {
  prune: 'Poda',
  fertilize: 'Fertilización',
  spray: 'Aplicación',
  irrigate: 'Riego',
  thin: 'Raleo',
  mow: 'Desbroce',
  manual_log: 'Registro manual',
  training: 'Tutorado',
  soil_amendment: 'Enmienda',
  pest_monitoring: 'Monitoreo',
  other: 'Otro',
};

type TimelineItem = {
  id: string;
  at: Date;
  kind: 'operation' | 'phenology' | 'scouting' | 'spray' | 'harvest';
  title: string;
  detail: string | undefined;
  badge: { tone: 'neutral' | 'brand' | 'warning' | 'danger' | 'success' | 'info'; label: string };
};

export default async function PlotDetail({ params }: { params: { id: string } }) {
  const sdk = getServerClient();

  let plot: Awaited<ReturnType<typeof sdk.getPlot>>;
  try {
    plot = await sdk.getPlot(params.id);
  } catch {
    notFound();
  }

  const [ops, phenology, scoutings, sprays, lots] = await Promise.all([
    sdk.listFieldOperations({ plotId: plot.id, pageSize: 100 }).catch(() => []),
    sdk.listPhenologyEvents(plot.id).catch(() => []),
    sdk.listScoutings(plot.id).catch(() => []),
    sdk.listSprays(plot.id).catch(() => []),
    sdk.listHarvestLots(plot.id).catch(() => []),
  ]);

  const items: TimelineItem[] = [
    ...ops.map((o) => ({
      id: o.id,
      at: new Date(o.startedAt),
      kind: 'operation' as const,
      title: OP_LABEL[o.operationType] ?? o.operationType,
      detail: o.notes ?? undefined,
      badge: { tone: 'info' as const, label: 'Operación' },
    })),
    ...phenology.map((e) => ({
      id: e.id,
      at: new Date(e.observedOn),
      kind: 'phenology' as const,
      title: `BBCH ${e.bbchCode}${e.stageLabel ? ` · ${e.stageLabel}` : ''}`,
      detail: e.pctInStage ? `${e.pctInStage}% en etapa` : undefined,
      badge: { tone: 'brand' as const, label: 'Fenología' },
    })),
    ...scoutings.map((s) => ({
      id: s.id,
      at: new Date(s.observedOn),
      kind: 'scouting' as const,
      title: `${s.target} · ${s.category}`,
      detail: `Severidad: ${s.severity}${s.incidencePct ? ` · Incidencia ${s.incidencePct}%` : ''}`,
      badge: { tone: severityTone(s.severity), label: 'Monitoreo' },
    })),
    ...sprays
      .filter((sp) => !sp.voidedAt)
      .map((sp) => ({
        id: sp.id,
        at: new Date(sp.appliedAt),
        kind: 'spray' as const,
        title: sp.productName,
        detail: `${sp.activeIngredient} · ${sp.doseAmount} ${sp.doseUnit} · PHI ${sp.phiDays}d`,
        badge: { tone: 'warning' as const, label: 'Aplicación' },
      })),
    ...lots.map((l) => ({
      id: l.id,
      at: new Date(l.harvestedOn),
      kind: 'harvest' as const,
      title: `Lote ${l.lotCode}`,
      detail: `${l.netWeightKg ?? l.grossKg ?? '?'} kg · ${l.qualityGrade ?? 'sin grado'} · ${l.destination ?? 'sin destino'}`,
      badge: { tone: 'success' as const, label: 'Cosecha' },
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  // Active PHI calculation
  const today = new Date();
  const activeSprays = sprays.filter((s) => {
    if (s.voidedAt) return false;
    const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
    return end > today;
  });
  const earliestHarvest =
    activeSprays.length > 0
      ? activeSprays
          .map((s) => new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000))
          .reduce((max, d) => (d > max ? d : max), new Date(0))
      : null;

  return (
    <div>
      <PageHeader
        breadcrumb={
          <span className="flex items-center gap-1">
            <Link href="/console/predios" className="hover:text-neutral-900 inline-flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" /> Predios
            </Link>
            <span>/</span>
            <Link href={`/console/predios/${plot.farmId}`} className="hover:text-neutral-900">
              Finca
            </Link>
          </span>
        }
        title={plot.name}
        description={
          <span className="inline-flex items-center gap-2">
            <Badge tone="neutral">{plot.code}</Badge>
            <Badge tone={plot.status === 'active' ? 'success' : 'neutral'}>{plot.status}</Badge>
            <span>{plot.areaHa ?? '—'} ha · {plot.treesCount ?? '—'} árboles</span>
          </span>
        }
      />

      {earliestHarvest ? (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>PHI activo:</strong> no cosechar antes del{' '}
            <strong>{earliestHarvest.toISOString().slice(0, 10)}</strong>. {activeSprays.length} aplicación(es) en curso.
          </span>
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatPill icon={ClipboardList} label="Operaciones" value={ops.length} />
        <StatPill icon={Sprout} label="Fenología" value={phenology.length} />
        <StatPill icon={Bug} label="Monitoreos" value={scoutings.length} />
        <StatPill icon={Beaker} label="Aplicaciones" value={sprays.length} />
        <StatPill icon={Wheat} label="Cosechas" value={lots.length} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-neutral-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Timeline del lote</h2>
            <p className="text-xs text-neutral-500">Todos los eventos registrados, ordenados por fecha descendente.</p>
          </div>
          {items.length === 0 ? (
            <EmptyState
              className="border-0"
              title="Sin eventos todavía"
              description="Registrá una operación, monitoreo, fenología o cosecha desde el menú lateral."
            />
          ) : (
            <ol className="divide-y divide-neutral-100">
              {items.map((it) => (
                <li key={`${it.kind}-${it.id}`} className="flex items-start gap-4 px-5 py-3">
                  <time className="mt-0.5 w-24 shrink-0 text-xs font-medium tabular-nums text-neutral-500">
                    {it.at.toISOString().slice(0, 10)}
                  </time>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {it.badge ? <Badge tone={it.badge.tone}>{it.badge.label}</Badge> : null}
                      <span className="text-sm font-medium text-neutral-900">{it.title}</span>
                    </div>
                    {it.detail ? <p className="mt-0.5 text-xs text-neutral-600">{it.detail}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string | undefined }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-base font-semibold tabular-nums text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

function severityTone(s: string): 'success' | 'brand' | 'warning' | 'danger' | 'neutral' {
  switch (s) {
    case 'none':
      return 'neutral';
    case 'low':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'high':
      return 'danger';
    case 'severe':
      return 'danger';
    default:
      return 'neutral';
  }
}
