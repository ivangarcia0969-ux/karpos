import { PageHeader, Card, CardContent, EmptyState, Badge } from '@karpos/ui';
import { getServerClient } from '@/lib/api-client';
import { CreateFarmForm } from './create-form';

export const dynamic = 'force-dynamic';

export default async function PrediosPage() {
  const client = getServerClient();
  let farms: Awaited<ReturnType<typeof client.listFarms>>['rows'] = [];
  let total = 0;
  try {
    const res = await client.listFarms({ pageSize: 100 });
    farms = res.rows;
    total = res.total;
  } catch {
    farms = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predios"
        description={`Fincas registradas en tu organización (${total}).`}
      />
      <CreateFarmForm />
      {farms.length === 0 ? (
        <EmptyState
          title="Aún no hay fincas"
          description="Crea la primera finca con el formulario de arriba."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((f) => (
            <Card key={f.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg">{f.name}</h3>
                  <Badge tone="leaf">{f.code}</Badge>
                </div>
                <p className="text-sm text-karpos-bark/70">
                  {f.region ?? '—'} · {f.countryCode}
                </p>
                <p className="text-sm text-karpos-bark/70">
                  Área: {f.totalAreaHa ?? '—'} ha · Elevación: {f.elevationM ?? '—'} m
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
