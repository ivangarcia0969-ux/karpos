import Link from 'next/link';
import { PageHeader, EmptyState, Badge, Card, CardContent } from '@karpos/ui';
import { Sprout } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewEventButton } from './new-event-button';

export const dynamic = 'force-dynamic';

export default async function FenoflowPage() {
  const sdk = getServerClient();
  const plots = await sdk.listPlots().catch(() => []);

  const eventsByPlot = await Promise.all(
    plots.slice(0, 50).map(async (p) => ({
      plot: p,
      events: await sdk.listPhenologyEvents(p.id).catch(() => []),
    })),
  );

  const totalEvents = eventsByPlot.reduce((s, p) => s + p.events.length, 0);
  const withEvents = eventsByPlot.filter((p) => p.events.length > 0);

  return (
    <div>
      <PageHeader
        title="Fenoflow"
        description={`${totalEvents} eventos BBCH en ${withEvents.length} lote${withEvents.length === 1 ? '' : 's'}.`}
        actions={<NewEventButton plots={plots} />}
      />

      {plots.length === 0 ? (
        <EmptyState
          icon={<Sprout className="h-10 w-10" />}
          title="No hay lotes"
          description="Creá un lote en Predios para registrar fenología."
        />
      ) : withEvents.length === 0 ? (
        <EmptyState
          icon={<Sprout className="h-10 w-10" />}
          title="Sin eventos fenológicos"
          description="Registrá el primer estado BBCH observado en alguno de tus lotes."
          action={<NewEventButton plots={plots} variant="primary" />}
        />
      ) : (
        <div className="space-y-4">
          {withEvents.map(({ plot, events }) => (
            <Card key={plot.id}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/console/lotes/${plot.id}`}
                      className="text-base font-semibold text-neutral-900 hover:text-brand-700"
                    >
                      {plot.name}
                    </Link>
                    <p className="text-xs text-neutral-500">
                      <span className="font-mono">{plot.code}</span> · {events.length} evento{events.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Badge tone="brand">{events[0] ? `Último BBCH ${events[0].bbchCode}` : '—'}</Badge>
                </div>
                <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                  {events.slice(0, 6).map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-start gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2"
                    >
                      <div className="flex h-9 w-12 flex-shrink-0 items-center justify-center rounded-md bg-brand-100 font-mono text-sm font-semibold text-brand-700">
                        {ev.bbchCode}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-neutral-900">
                          {ev.stageLabel ?? 'Sin etiqueta'}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {ev.observedOn}
                          {ev.pctInStage ? ` · ${ev.pctInStage}% en etapa` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
