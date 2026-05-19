import { PageHeader, Card, CardContent, EmptyState, Badge } from '@karpos/ui';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

const SEVERITY_TONE: Record<string, 'leaf' | 'clay' | 'amber'> = {
  none: 'leaf',
  low: 'leaf',
  moderate: 'amber',
  high: 'clay',
  severe: 'clay',
};

export default async function SanidadPage() {
  const sdk = getServerClient();
  const [sprays, plots] = await Promise.all([
    sdk.listSprays().catch(() => []),
    sdk.listPlots().catch(() => []),
  ]);

  const scoutingsByPlot = await Promise.all(
    plots.slice(0, 25).map(async (p) => ({
      plot: p,
      scoutings: await sdk.listScoutings(p.id).catch(() => []),
    })),
  );

  const activeSprays = sprays.filter((s) => !s.voidedAt);
  const today = new Date();
  const phiActive = activeSprays.filter((s) => {
    const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
    return end > today;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sanidad+"
        description={`Monitoreos y aplicaciones registradas. ${phiActive.length} lote(s) con PHI activo.`}
      />

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-display text-lg">Aplicaciones recientes</h3>
          {activeSprays.length === 0 ? (
            <p className="mt-3 text-sm text-karpos-bark/60">Sin aplicaciones registradas.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead className="border-b border-karpos-fog text-left">
                <tr>
                  <th className="py-2">Producto</th>
                  <th className="py-2">Ingrediente</th>
                  <th className="py-2">Dosis</th>
                  <th className="py-2">Aplicado</th>
                  <th className="py-2 text-right">PHI (días)</th>
                </tr>
              </thead>
              <tbody>
                {activeSprays.slice(0, 20).map((s) => (
                  <tr key={s.id} className="border-b border-karpos-fog/40">
                    <td className="py-2">{s.productName}</td>
                    <td className="py-2 text-karpos-bark/70">{s.activeIngredient}</td>
                    <td className="py-2">
                      {s.doseAmount} {s.doseUnit}
                    </td>
                    <td className="py-2">{new Date(s.appliedAt).toLocaleDateString()}</td>
                    <td className="py-2 text-right">{s.phiDays}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="font-display text-xl">Monitoreos por lote</h2>
        {scoutingsByPlot.filter((p) => p.scoutings.length > 0).length === 0 ? (
          <EmptyState title="Sin monitoreos" description="Registrá un monitoreo desde la app móvil." />
        ) : (
          scoutingsByPlot
            .filter((p) => p.scoutings.length > 0)
            .map(({ plot, scoutings }) => (
              <Card key={plot.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg">{plot.name}</h3>
                    <Badge tone="leaf">{scoutings.length}</Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {scoutings.slice(0, 5).map((sc) => (
                      <li
                        key={sc.id}
                        className="flex items-center justify-between border-b border-karpos-fog/40 pb-1"
                      >
                        <span>
                          <span className="font-medium">{sc.target}</span>
                          <span className="ml-2 text-karpos-bark/60">{sc.category}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <Badge tone={SEVERITY_TONE[sc.severity] ?? 'leaf'}>{sc.severity}</Badge>
                          <span className="text-xs text-karpos-bark/60">{sc.observedOn}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
}
