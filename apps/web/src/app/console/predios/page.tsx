import { PageHeader, Button, Card, CardContent, EmptyState, Badge } from '@karpos/ui';
import { Plus } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function PrediosPage() {
  const client = getServerClient();
  let farms: Awaited<ReturnType<typeof client.listFarms>>['rows'] = [];
  try {
    const res = await client.listFarms({ pageSize: 100 });
    farms = res.rows;
  } catch {
    farms = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predios"
        description="Fincas, sectores y lotes geo-referenciados."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva finca
          </Button>
        }
      />
      {farms.length === 0 ? (
        <EmptyState
          title="Aún no hay fincas"
          description="Crea la primera finca para empezar a registrar lotes y árboles."
          action={<Button>Crear finca</Button>}
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
                  Área: {f.totalAreaHa ?? '—'} ha
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
