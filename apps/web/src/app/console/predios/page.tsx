import Link from 'next/link';
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
import { Trees, ChevronRight } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';
import { NewFarmButton } from './new-farm-button';

export const dynamic = 'force-dynamic';

export default async function PrediosPage() {
  const sdk = getServerClient();
  let rows: Awaited<ReturnType<typeof sdk.listFarms>>['rows'] = [];
  let total = 0;
  try {
    const res = await sdk.listFarms({ pageSize: 100 });
    rows = res.rows;
    total = res.total;
  } catch {
    rows = [];
  }

  const totalHa = rows.reduce((s, f) => s + Number(f.totalAreaHa ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Predios"
        description={`${total} finca${total === 1 ? '' : 's'} · ${totalHa.toFixed(1)} ha en producción`}
        actions={<NewFarmButton />}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Trees className="h-10 w-10" />}
          title="No hay fincas todavía"
          description="Creá tu primera finca para empezar a registrar lotes, operaciones y cosechas."
          action={<NewFarmButton variant="primary" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Finca</TH>
                <TH>Código</TH>
                <TH>Ubicación</TH>
                <TH className="text-right">Área (ha)</TH>
                <TH className="text-right">Elevación</TH>
                <TH />
              </TR>
            </THead>
            <tbody>
              {rows.map((f) => (
                <TR key={f.id} className="hover:bg-neutral-50">
                  <TD className="font-medium text-neutral-900">
                    <Link href={`/console/predios/${f.id}`} className="hover:text-brand-700">
                      {f.name}
                    </Link>
                  </TD>
                  <TD>
                    <Badge tone="neutral">{f.code}</Badge>
                  </TD>
                  <TD className="text-neutral-600">
                    {[f.region, f.locality].filter(Boolean).join(', ') || '—'} · {f.countryCode}
                  </TD>
                  <TD className="text-right tabular-nums">{f.totalAreaHa ?? '—'}</TD>
                  <TD className="text-right tabular-nums">{f.elevationM ? `${f.elevationM} m` : '—'}</TD>
                  <TD className="text-right">
                    <Link
                      href={`/console/predios/${f.id}`}
                      className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-brand-700"
                    >
                      Ver lotes <ChevronRight className="h-3.5 w-3.5" />
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
