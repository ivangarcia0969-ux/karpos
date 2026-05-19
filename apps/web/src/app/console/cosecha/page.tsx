import { PageHeader, Card, CardContent, EmptyState, Badge } from '@karpos/ui';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function CosechaPage() {
  const sdk = getServerClient();
  const [lots, plans] = await Promise.all([
    sdk.listHarvestLots().catch(() => []),
    sdk.listHarvestPlans().catch(() => []),
  ]);

  const totalKg = lots.reduce(
    (s, l) => s + Number(l.netWeightKg ?? l.grossKg ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cosecha360"
        description={`${lots.length} lote(s) cosechado(s), ${plans.length} plan(es) de temporada — total ${totalKg.toFixed(0)} kg.`}
      />

      {plans.length > 0 ? (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-display text-lg">Planes de temporada</h3>
            <table className="mt-3 w-full text-sm">
              <thead className="border-b border-karpos-fog text-left">
                <tr>
                  <th className="py-2">Temporada</th>
                  <th className="py-2">Estado</th>
                  <th className="py-2 text-right">Rendimiento esperado (kg)</th>
                  <th className="py-2">Ventana</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.id} className="border-b border-karpos-fog/40">
                    <td className="py-2">{p.seasonYear}</td>
                    <td className="py-2">
                      <Badge tone="leaf">{p.status}</Badge>
                    </td>
                    <td className="py-2 text-right">{p.expectedYieldKg ?? '—'}</td>
                    <td className="py-2 text-karpos-bark/70">
                      {p.expectedStartDate ?? '—'} → {p.expectedEndDate ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      {lots.length === 0 ? (
        <EmptyState
          title="Sin lotes cosechados"
          description="Cuando registres pesajes desde la app móvil aparecerán acá."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-karpos-fog bg-karpos-cream">
                <tr>
                  <th className="px-4 py-2 text-left">Código</th>
                  <th className="px-4 py-2 text-left">Cosechado</th>
                  <th className="px-4 py-2 text-right">Bruto (kg)</th>
                  <th className="px-4 py-2 text-right">Tara (kg)</th>
                  <th className="px-4 py-2 text-right">Neto (kg)</th>
                  <th className="px-4 py-2 text-left">Calidad</th>
                  <th className="px-4 py-2 text-left">Destino</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((l) => {
                  const gross = Number(l.grossKg ?? 0);
                  const tare = Number(l.tareKg ?? 0);
                  const net = l.netWeightKg != null ? Number(l.netWeightKg) : gross - tare;
                  return (
                    <tr key={l.id} className="border-b border-karpos-fog/40">
                      <td className="px-4 py-2 font-medium">{l.lotCode}</td>
                      <td className="px-4 py-2">{l.harvestedOn}</td>
                      <td className="px-4 py-2 text-right">{gross.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">{tare.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-medium">{net.toFixed(2)}</td>
                      <td className="px-4 py-2">{l.qualityGrade ?? '—'}</td>
                      <td className="px-4 py-2 text-karpos-bark/70">{l.destination ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
