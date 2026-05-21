import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { ChevronLeft, Layers, ChevronRight } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewPlotButton } from './new-plot-button';

export const dynamic = 'force-dynamic';

export default async function FarmDetail({ params }: { params: { id: string } }) {
  const sdk = getServerClient();

  let farm: Awaited<ReturnType<typeof sdk.getFarm>>;
  try {
    farm = await sdk.getFarm(params.id);
  } catch {
    notFound();
  }

  const plots = await sdk.listPlots(params.id).catch(() => []);
  const plotsArea = plots.reduce((s, p) => s + Number(p.areaHa ?? 0), 0);

  return (
    <div>
      <PageHeader
        breadcrumb={
          <Link href="/console/predios" className="inline-flex items-center gap-1 hover:text-neutral-900">
            <ChevronLeft className="h-3.5 w-3.5" /> Predios
          </Link>
        }
        title={farm.name}
        description={
          <span className="flex items-center gap-2">
            <Badge tone="neutral">{farm.code}</Badge>
            <span>{[farm.region, farm.locality].filter(Boolean).join(', ') || '—'} · {farm.countryCode}</span>
          </span>
        }
        actions={<NewPlotButton farmId={farm.id} />}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <InfoCell label="Área total" value={`${farm.totalAreaHa ?? '—'} ha`} />
        <InfoCell label="Elevación" value={farm.elevationM ? `${farm.elevationM} m` : '—'} />
        <InfoCell label="Zona horaria" value={farm.timezone} />
        <InfoCell label="Lotes" value={String(plots.length)} hint={`${plotsArea.toFixed(1)} ha en lotes`} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-neutral-900">
        <Layers className="mr-2 inline h-4 w-4 text-neutral-400" />
        Lotes
      </h2>

      {plots.length === 0 ? (
        <EmptyState
          title="No hay lotes en esta finca"
          description="Los lotes son las unidades operativas donde registrás cosechas, sanidad y fenología."
          action={<NewPlotButton farmId={farm.id} variant="primary" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Lote</TH>
                <TH>Código</TH>
                <TH>Especie</TH>
                <TH>Plantación</TH>
                <TH className="text-right">Área (ha)</TH>
                <TH className="text-right">Árboles</TH>
                <TH>Estado</TH>
                <TH />
              </TR>
            </THead>
            <tbody>
              {plots.map((p) => (
                <TR key={p.id} className="hover:bg-neutral-50">
                  <TD className="font-medium text-neutral-900">
                    <Link href={`/console/lotes/${p.id}`} className="hover:text-brand-700">
                      {p.name}
                    </Link>
                  </TD>
                  <TD>
                    <Badge tone="neutral">{p.code}</Badge>
                  </TD>
                  <TD className="text-neutral-600">{p.speciesId ? <span className="font-mono text-xs">{p.speciesId.slice(0, 8)}…</span> : '—'}</TD>
                  <TD>{p.plantingDate ?? '—'}</TD>
                  <TD className="text-right tabular-nums">{p.areaHa ?? '—'}</TD>
                  <TD className="text-right tabular-nums">{p.treesCount ?? '—'}</TD>
                  <TD>
                    <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/console/lotes/${p.id}`}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-700"
                    >
                      Abrir <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

function InfoCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
        <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-neutral-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
