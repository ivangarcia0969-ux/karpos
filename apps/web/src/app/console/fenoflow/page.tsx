import { PageHeader, Card, CardContent, EmptyState, Badge } from '@karpos/ui';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function FenoflowPage() {
  const sdk = getServerClient();

  let plots: Awaited<ReturnType<typeof sdk.listPlots>> = [];
  try {
    plots = await sdk.listPlots();
  } catch {
    plots = [];
  }

  const eventsByPlot = await Promise.all(
    plots.slice(0, 25).map(async (p) => ({
      plot: p,
      events: await sdk.listPhenologyEvents(p.id).catch(() => []),
    })),
  );

  const totalEvents = eventsByPlot.reduce((s, p) => s + p.events.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fenoflow"
        description={`Estados fenológicos BBCH por lote (${totalEvents} eventos).`}
      />
      {plots.length === 0 ? (
        <EmptyState
          title="No hay lotes"
          description="Creá una finca y al menos un lote en la sección Predios para registrar fenología."
        />
      ) : (
        <div className="space-y-4">
          {eventsByPlot.map(({ plot, events }) => (
            <Card key={plot.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg">{plot.name}</h3>
                    <p className="text-xs text-karpos-bark/60">Código: {plot.code}</p>
                  </div>
                  <Badge tone="leaf">{events.length} eventos</Badge>
                </div>
                {events.length > 0 ? (
                  <ul className="mt-4 space-y-1 text-sm">
                    {events.slice(0, 5).map((ev) => (
                      <li
                        key={ev.id}
                        className="flex items-center justify-between border-b border-karpos-fog/40 pb-1"
                      >
                        <span>
                          <span className="font-mono text-karpos-leaf">BBCH {ev.bbchCode}</span>
                          {ev.stageLabel ? <span className="ml-2 text-karpos-bark/70">{ev.stageLabel}</span> : null}
                        </span>
                        <span className="text-xs text-karpos-bark/60">{ev.observedOn}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-karpos-bark/60">Sin eventos registrados.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
