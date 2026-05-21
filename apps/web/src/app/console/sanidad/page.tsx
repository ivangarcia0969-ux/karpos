import {
  PageHeader,
  EmptyState,
  Badge,
  Card,
  CardContent,
  TableContainer,
  Table,
  THead,
  TR,
  TH,
  TD,
} from '@karpos/ui';
import { Bug, AlertTriangle } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewScoutingButton } from './new-scouting-button';
import { NewSprayButton } from './new-spray-button';
import { VoidSprayButton } from './void-spray-button';

export const dynamic = 'force-dynamic';

export default async function SanidadPage() {
  const sdk = getServerClient();
  const [sprays, plots] = await Promise.all([
    sdk.listSprays().catch(() => []),
    sdk.listPlots().catch(() => []),
  ]);

  const plotById = new Map(plots.map((p) => [p.id, p]));

  const today = new Date();
  const activeSprays = sprays.filter((s) => !s.voidedAt);
  const phiActive = activeSprays.filter((s) => {
    const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
    return end > today;
  });

  return (
    <div>
      <PageHeader
        title="Sanidad+"
        description={`${activeSprays.length} aplicaciones vigentes · ${phiActive.length} lote(s) con PHI activo`}
        actions={
          <div className="flex gap-2">
            <NewScoutingButton plots={plots} />
            <NewSprayButton plots={plots} />
          </div>
        }
      />

      {phiActive.length > 0 ? (
        <div className="mb-6 rounded-lg border border-warning-500/30 bg-warning-50 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-warning-700">
            <AlertTriangle className="h-4 w-4" />
            <strong>{phiActive.length} aplicación(es)</strong> con PHI vigente. No cosechar los siguientes lotes hasta:
          </p>
          <ul className="mt-2 grid gap-1 text-xs text-warning-700 sm:grid-cols-2">
            {phiActive.map((s) => {
              const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
              const plot = plotById.get(s.plotId);
              return (
                <li key={s.id}>
                  <strong>{plot?.name ?? s.plotId.slice(0, 8)}</strong> · {s.productName} · hasta{' '}
                  <span className="font-mono">{end.toISOString().slice(0, 10)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-neutral-900">Aplicaciones fitosanitarias</h2>
            <p className="text-xs text-neutral-500">Registros append-only — sólo se pueden anular con razón.</p>
          </div>
          {activeSprays.length === 0 ? (
            <EmptyState
              className="border-0 rounded-none"
              icon={<Bug className="h-10 w-10" />}
              title="Sin aplicaciones registradas"
              description="Registrá la primera aplicación con producto, dosis, PHI y operario."
              action={<NewSprayButton plots={plots} variant="primary" />}
            />
          ) : (
            <TableContainer className="border-0 rounded-none shadow-none">
              <Table>
                <THead>
                  <TR>
                    <TH>Producto</TH>
                    <TH>I.A.</TH>
                    <TH>Lote</TH>
                    <TH>Aplicado</TH>
                    <TH className="text-right">Dosis</TH>
                    <TH className="text-right">PHI</TH>
                    <TH>Operario</TH>
                    <TH />
                  </TR>
                </THead>
                <tbody>
                  {activeSprays.map((s) => {
                    const end = new Date(new Date(s.appliedAt).getTime() + s.phiDays * 86400000);
                    const phiOn = end > today;
                    const plot = plotById.get(s.plotId);
                    return (
                      <TR key={s.id} className="hover:bg-neutral-50">
                        <TD className="font-medium text-neutral-900">{s.productName}</TD>
                        <TD className="text-neutral-600">{s.activeIngredient}</TD>
                        <TD>{plot?.name ?? <span className="font-mono text-xs">{s.plotId.slice(0, 8)}…</span>}</TD>
                        <TD className="tabular-nums">{new Date(s.appliedAt).toLocaleDateString('es-CO')}</TD>
                        <TD className="text-right tabular-nums">
                          {Number(s.doseAmount)} {s.doseUnit}
                        </TD>
                        <TD className="text-right">
                          <Badge tone={phiOn ? 'warning' : 'success'}>
                            {phiOn ? `${s.phiDays}d → ${end.toISOString().slice(5, 10)}` : 'libre'}
                          </Badge>
                        </TD>
                        <TD className="text-neutral-600">{s.operator}</TD>
                        <TD className="text-right">
                          <VoidSprayButton id={s.id} />
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
