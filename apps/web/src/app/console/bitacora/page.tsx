import { PageHeader, Card, CardContent, EmptyState } from '@karpos/ui';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

const OP_LABELS: Record<string, string> = {
  prune: 'Poda',
  fertilize: 'Fertilización',
  spray: 'Aplicación',
  irrigate: 'Riego',
  thin: 'Raleo',
  mow: 'Desbroce',
  manual_log: 'Manual',
  training: 'Tutorado',
  soil_amendment: 'Enmienda',
  pest_monitoring: 'Monitoreo',
  other: 'Otro',
};

export default async function BitacoraPage() {
  const sdk = getServerClient();
  let ops: Awaited<ReturnType<typeof sdk.listFieldOperations>> = [];
  try {
    ops = await sdk.listFieldOperations({ pageSize: 200 });
  } catch {
    ops = [];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora Verde"
        description={`Operaciones de campo registradas (${ops.length}).`}
      />
      {ops.length === 0 ? (
        <EmptyState
          title="Sin operaciones"
          description="Registrá la primera operación desde la app móvil o desde el detalle de un lote."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-karpos-fog bg-karpos-cream">
                <tr>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Lote</th>
                  <th className="px-4 py-2 text-left">Inicio</th>
                  <th className="px-4 py-2 text-left">Fin</th>
                  <th className="px-4 py-2 text-right">Área (ha)</th>
                  <th className="px-4 py-2 text-left">Notas</th>
                </tr>
              </thead>
              <tbody>
                {ops.map((op) => (
                  <tr key={op.id} className="border-b border-karpos-fog/40">
                    <td className="px-4 py-2 font-medium">
                      {OP_LABELS[op.operationType] ?? op.operationType}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{op.plotId.slice(0, 8)}…</td>
                    <td className="px-4 py-2">{new Date(op.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      {op.endedAt ? new Date(op.endedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">{op.areaHa ?? '—'}</td>
                    <td className="px-4 py-2 text-karpos-bark/70">{op.notes ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
