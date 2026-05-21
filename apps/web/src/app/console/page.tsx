import Link from 'next/link';
import { PageHeader, StatCard, Card, CardContent, Badge } from '@karpos/ui';
import { Trees, Wheat, AlertTriangle, ClipboardList, Sprout, Bug } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const sdk = getServerClient();
  const [farmsPage, plots, ops, lots, sprays] = await Promise.all([
    sdk.listFarms({ pageSize: 1 }).catch(() => ({ total: 0, rows: [] })),
    sdk.listPlots().catch(() => []),
    sdk.listFieldOperations({ pageSize: 5 }).catch(() => []),
    sdk.listHarvestLots().catch(() => []),
    sdk.listSprays().catch(() => []),
  ]);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const lotsToday = lots.filter((l) => l.harvestedOn === todayStr);
  const kgToday = lotsToday.reduce((s, l) => s + Number(l.netWeightKg ?? l.grossKg ?? 0), 0);

  const activeSprays = sprays.filter((s) => !s.voidedAt);
  const phiActive = activeSprays.filter((s) => {
    const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
    return end > today;
  });

  const plotById = new Map(plots.map((p) => [p.id, p]));

  return (
    <div>
      <PageHeader
        title="Tablero"
        description="Estado operativo en vivo. Acá ves lo que importa hoy."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Predios"
          value={farmsPage.total ?? 0}
          icon={<Trees className="h-4 w-4" />}
          hint={`${plots.length} lote${plots.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="PHI activo"
          value={phiActive.length}
          tone={phiActive.length > 0 ? 'warning' : 'neutral'}
          icon={<AlertTriangle className="h-4 w-4" />}
          hint={phiActive.length > 0 ? 'No cosechar estos lotes' : 'Todos los lotes libres'}
        />
        <StatCard
          label="Cosecha de hoy"
          value={`${kgToday.toFixed(0)} kg`}
          tone={kgToday > 0 ? 'brand' : 'neutral'}
          icon={<Wheat className="h-4 w-4" />}
          hint={`${lotsToday.length} lote${lotsToday.length === 1 ? '' : 's'}`}
        />
        <StatCard
          label="Total cosechado"
          value={`${lots.reduce((s, l) => s + Number(l.netWeightKg ?? l.grossKg ?? 0), 0).toLocaleString('es-CO')} kg`}
          icon={<Wheat className="h-4 w-4" />}
          hint={`${lots.length} lote${lots.length === 1 ? '' : 's'} histórico`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="border-b border-neutral-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-neutral-900">Últimas operaciones</h2>
            </div>
            {ops.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-neutral-500">
                Sin operaciones registradas.
                <Link href="/console/bitacora" className="ml-2 font-medium text-brand-700 hover:underline">
                  Registrar la primera →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {ops.map((op) => {
                  const plot = plotById.get(op.plotId);
                  return (
                    <li key={op.id} className="flex items-center justify-between px-5 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-900">
                          {plot?.name ?? <span className="font-mono text-xs">{op.plotId.slice(0, 8)}…</span>}
                        </p>
                        <p className="truncate text-xs text-neutral-500">{op.operationType} · {op.notes ?? 'sin notas'}</p>
                      </div>
                      <time className="ml-3 shrink-0 text-xs text-neutral-500">
                        {new Date(op.startedAt).toLocaleDateString('es-CO')}
                      </time>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Atajos</h2>
            <div className="grid gap-2">
              <ShortcutLink href="/console/bitacora" icon={<ClipboardList className="h-4 w-4" />} label="Registrar operación" />
              <ShortcutLink href="/console/sanidad" icon={<Bug className="h-4 w-4" />} label="Registrar aplicación" />
              <ShortcutLink href="/console/fenoflow" icon={<Sprout className="h-4 w-4" />} label="Evento fenológico" />
              <ShortcutLink href="/console/cosecha" icon={<Wheat className="h-4 w-4" />} label="Pesar lote" />
            </div>
          </CardContent>
        </Card>
      </div>

      {phiActive.length > 0 ? (
        <Card className="mt-6 border-warning-500/30 bg-warning-50">
          <CardContent>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-warning-700">
              <AlertTriangle className="h-4 w-4" /> Lotes con PHI vigente
            </h2>
            <ul className="mt-3 grid gap-1 text-sm text-warning-700 sm:grid-cols-2">
              {phiActive.slice(0, 10).map((s) => {
                const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
                const plot = plotById.get(s.plotId);
                return (
                  <li key={s.id}>
                    <strong>{plot?.name ?? s.plotId.slice(0, 8)}</strong> · {s.productName} ·{' '}
                    <Badge tone="warning">hasta {end.toISOString().slice(0, 10)}</Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ShortcutLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900"
    >
      <span className="flex items-center gap-2">
        <span className="text-neutral-400">{icon}</span>
        {label}
      </span>
      <span className="text-neutral-400">→</span>
    </Link>
  );
}
