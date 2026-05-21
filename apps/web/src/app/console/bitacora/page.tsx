import {
  PageHeader,
  EmptyState,
  Badge,
  TableContainer,
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@karpos/ui';
import { ClipboardList } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewOperationButton } from './new-operation-button';

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

export default async function BitacoraPage() {
  const sdk = getServerClient();
  const [ops, plots] = await Promise.all([
    sdk.listFieldOperations({ pageSize: 200 }).catch(() => []),
    sdk.listPlots().catch(() => []),
  ]);

  const plotById = new Map(plots.map((p) => [p.id, p]));

  return (
    <div>
      <PageHeader
        title="Bitácora Verde"
        description={`${ops.length} operación${ops.length === 1 ? '' : 'es'} registrada${ops.length === 1 ? '' : 's'}.`}
        actions={<NewOperationButton plots={plots} />}
      />

      {ops.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="Sin operaciones todavía"
          description="Registrá podas, aplicaciones, riegos y demás labores con su consumo de insumos."
          action={<NewOperationButton plots={plots} variant="primary" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Tipo</TH>
                <TH>Lote</TH>
                <TH>Inicio</TH>
                <TH>Fin</TH>
                <TH className="text-right">Área (ha)</TH>
                <TH>Notas</TH>
              </TR>
            </THead>
            <tbody>
              {ops.map((op) => {
                const plot = plotById.get(op.plotId);
                return (
                  <TR key={op.id} className="hover:bg-neutral-50">
                    <TD>
                      <Badge tone="info">{OP_LABEL[op.operationType] ?? op.operationType}</Badge>
                    </TD>
                    <TD className="font-medium text-neutral-900">{plot ? plot.name : <span className="font-mono text-xs">{op.plotId.slice(0, 8)}…</span>}</TD>
                    <TD className="tabular-nums">{new Date(op.startedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</TD>
                    <TD className="tabular-nums">{op.endedAt ? new Date(op.endedAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</TD>
                    <TD className="text-right tabular-nums">{op.areaHa ?? '—'}</TD>
                    <TD className="max-w-md truncate text-neutral-600">{op.notes ?? '—'}</TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
