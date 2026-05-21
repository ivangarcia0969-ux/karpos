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
import { Wheat } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewPlanButton } from './new-plan-button';
import { NewLotButton } from './new-lot-button';

export const dynamic = 'force-dynamic';

export default async function CosechaPage() {
  const sdk = getServerClient();
  const [lots, plans, plots] = await Promise.all([
    sdk.listHarvestLots().catch(() => []),
    sdk.listHarvestPlans().catch(() => []),
    sdk.listPlots().catch(() => []),
  ]);

  const plotById = new Map(plots.map((p) => [p.id, p]));

  const totalKg = lots.reduce((s, l) => s + Number(l.netWeightKg ?? l.grossKg ?? 0), 0);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayKg = lots
    .filter((l) => l.harvestedOn === todayStr)
    .reduce((s, l) => s + Number(l.netWeightKg ?? l.grossKg ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Cosecha360"
        description={`${lots.length} lote(s) · ${plans.length} plan(es) · ${totalKg.toLocaleString('es-CO')} kg total`}
        actions={
          <div className="flex gap-2">
            <NewPlanButton plots={plots} />
            <NewLotButton plots={plots} plans={plans} />
          </div>
        }
      />

      {plans.length > 0 ? (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="border-b border-neutral-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-neutral-900">Planes de temporada</h2>
            </div>
            <Table>
              <THead>
                <TR>
                  <TH>Año</TH>
                  <TH>Lote</TH>
                  <TH>Ventana</TH>
                  <TH className="text-right">Yield esperado (kg)</TH>
                  <TH className="text-right">kg/ha</TH>
                  <TH>Estado</TH>
                </TR>
              </THead>
              <tbody>
                {plans.map((p) => (
                  <TR key={p.id} className="hover:bg-neutral-50">
                    <TD className="font-medium tabular-nums">{p.seasonYear}</TD>
                    <TD>{plotById.get(p.plotId)?.name ?? <span className="font-mono text-xs">{p.plotId.slice(0, 8)}…</span>}</TD>
                    <TD className="text-neutral-600">
                      {p.expectedStartDate ?? '—'} → {p.expectedEndDate ?? '—'}
                    </TD>
                    <TD className="text-right tabular-nums">{p.expectedYieldKg ?? '—'}</TD>
                    <TD className="text-right tabular-nums">{p.expectedYieldKgHa ?? '—'}</TD>
                    <TD>
                      <Badge tone={p.status === 'in_progress' ? 'info' : p.status === 'closed' ? 'neutral' : 'brand'}>
                        {p.status}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Lotes cosechados</h2>
              <p className="text-xs text-neutral-500">Hoy: {todayKg.toFixed(0)} kg</p>
            </div>
          </div>
          {lots.length === 0 ? (
            <EmptyState
              className="border-0 rounded-none"
              icon={<Wheat className="h-10 w-10" />}
              title="Sin lotes cosechados"
              description="Registrá tu primer lote con peso bruto/tara y destino."
              action={<NewLotButton plots={plots} plans={plans} variant="primary" />}
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Código</TH>
                  <TH>Lote campo</TH>
                  <TH>Cosechado</TH>
                  <TH className="text-right">Bruto (kg)</TH>
                  <TH className="text-right">Tara</TH>
                  <TH className="text-right">Neto</TH>
                  <TH>Calidad</TH>
                  <TH>Destino</TH>
                </TR>
              </THead>
              <tbody>
                {lots.map((l) => {
                  const gross = Number(l.grossKg ?? 0);
                  const tare = Number(l.tareKg ?? 0);
                  const net = l.netWeightKg != null ? Number(l.netWeightKg) : gross - tare;
                  return (
                    <TR key={l.id} className="hover:bg-neutral-50">
                      <TD className="font-medium font-mono text-xs">{l.lotCode}</TD>
                      <TD>{plotById.get(l.plotId)?.name ?? '—'}</TD>
                      <TD className="tabular-nums">{l.harvestedOn}</TD>
                      <TD className="text-right tabular-nums">{gross.toFixed(2)}</TD>
                      <TD className="text-right tabular-nums">{tare.toFixed(2)}</TD>
                      <TD className="text-right font-semibold tabular-nums">{net.toFixed(2)}</TD>
                      <TD>{l.qualityGrade ?? '—'}</TD>
                      <TD className="text-neutral-600">{l.destination ?? '—'}</TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
