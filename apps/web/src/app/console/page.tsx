import { Card, CardContent, CardHeader, CardTitle, PageHeader } from '@karpos/ui';
import { getServerClient } from '../../lib/api-client.js';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const sdk = getServerClient();

  const [farmsPage, lots, sprays] = await Promise.all([
    sdk.listFarms({ pageSize: 1 }).catch(() => ({ total: 0 })),
    sdk.listHarvestLots().catch(() => []),
    sdk.listSprays().catch(() => []),
  ]);

  const today = new Date();
  const phiActive = sprays.filter((s) => {
    if (!s.appliedAt || s.voidedAt) return false;
    const appliedDate = new Date(s.appliedAt);
    const phiEnd = new Date(appliedDate.getTime() + s.phiDays * 24 * 3600 * 1000);
    return phiEnd > today;
  }).length;

  const todayStr = today.toISOString().slice(0, 10);
  const lotsToday = lots.filter((l) => l.harvestedOn === todayStr);
  const kgToday = lotsToday.reduce((sum, l) => sum + Number(l.netWeightKg ?? l.grossKg ?? 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Tablero" description="Resumen operativo del tenant." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Predios" value={String(farmsPage.total ?? 0)} hint="totales" />
        <KpiCard
          label="Lotes con PHI activo"
          value={String(phiActive)}
          tone="warn"
          hint="no cosechar"
        />
        <KpiCard
          label="Cosecha del día"
          value={`${kgToday.toFixed(0)} kg`}
          hint={`${lotsToday.length} lotes`}
        />
        <KpiCard label="Lotes totales" value={String(lots.length)} hint="histórico" />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'warn';
}) {
  const colorClass = tone === 'warn' ? 'text-karpos-clay' : 'text-karpos-leaf';
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-display text-4xl ${colorClass}`}>{value}</p>
        {hint ? <p className="text-sm text-karpos-bark/60">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
