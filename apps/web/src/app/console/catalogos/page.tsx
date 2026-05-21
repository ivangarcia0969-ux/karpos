import { PageHeader, EmptyState, Badge, TableContainer, Table, THead, TR, TH, TD } from '@karpos/ui';
import { Library } from 'lucide-react';
import { getServerClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

const CATEGORY_LABEL: Record<string, string> = {
  fungicide: 'Fungicida',
  insecticide: 'Insecticida',
  acaricide: 'Acaricida',
  herbicide: 'Herbicida',
  bactericide: 'Bactericida',
  nematicide: 'Nematicida',
  plant_growth_regulator: 'Regulador',
  biological: 'Biológico',
  adjuvant: 'Coadyuvante',
  fertilizer: 'Fertilizante',
  other: 'Otro',
};

const CATEGORY_TONE: Record<string, 'brand' | 'warning' | 'danger' | 'info' | 'success' | 'neutral'> = {
  fungicide: 'info',
  insecticide: 'danger',
  acaricide: 'warning',
  herbicide: 'neutral',
  biological: 'success',
  fertilizer: 'brand',
  adjuvant: 'neutral',
};

const TOX_TONE: Record<string, 'danger' | 'warning' | 'info' | 'success'> = {
  I: 'danger',
  II: 'warning',
  III: 'info',
  IV: 'success',
};

export default async function CatalogosPage() {
  const sdk = getServerClient();
  const products = await sdk.listFitoProducts().catch(() => []);

  const byCategory = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Catálogos · Fitosanitarios"
        description={`${products.length} productos registrados ICA · período de carencia (PHI), reingreso (REI), dosis y objetivos.`}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(byCategory).map(([cat, count]) => (
          <Badge key={cat} tone={CATEGORY_TONE[cat] ?? 'neutral'}>
            {CATEGORY_LABEL[cat] ?? cat}: {count}
          </Badge>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<Library className="h-10 w-10" />}
          title="Sin productos en el catálogo"
          description="El catálogo se siembra con productos registrados ICA Colombia. Corré el seed-fito desde el VPS."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <TR>
                <TH>Producto</TH>
                <TH>Ingrediente activo</TH>
                <TH>Categoría</TH>
                <TH>Tox</TH>
                <TH>Registro ICA</TH>
                <TH className="text-right">PHI</TH>
                <TH className="text-right">REI</TH>
                <TH>Dosis recom.</TH>
                <TH>Cultivos</TH>
                <TH>Fabricante</TH>
              </TR>
            </THead>
            <tbody>
              {products.map((p) => (
                <TR key={p.id} className="hover:bg-neutral-50">
                  <TD className="font-medium text-neutral-900">
                    {p.commercialName}
                    {p.formulationType ? <span className="ml-2 text-xs text-neutral-500">{p.formulationType}</span> : null}
                  </TD>
                  <TD className="text-neutral-700">{p.activeIngredient}</TD>
                  <TD>
                    <Badge tone={CATEGORY_TONE[p.category] ?? 'neutral'}>
                      {CATEGORY_LABEL[p.category] ?? p.category}
                    </Badge>
                  </TD>
                  <TD>
                    {p.toxicologyClass ? (
                      <Badge tone={TOX_TONE[p.toxicologyClass] ?? 'neutral'}>{p.toxicologyClass}</Badge>
                    ) : (
                      '—'
                    )}
                  </TD>
                  <TD className="font-mono text-xs">{p.registrationNo ?? '—'}</TD>
                  <TD className="text-right tabular-nums">{p.defaultPhiDays}d</TD>
                  <TD className="text-right tabular-nums">{p.defaultReiHours ? `${p.defaultReiHours}h` : '—'}</TD>
                  <TD className="text-neutral-600 tabular-nums">
                    {p.recommendedDoseMin
                      ? `${p.recommendedDoseMin}–${p.recommendedDoseMax ?? '?'} ${p.doseUnit ?? ''}`
                      : '—'}
                  </TD>
                  <TD className="text-xs text-neutral-500">
                    {p.targetCrops.slice(0, 3).join(', ')}
                    {p.targetCrops.length > 3 ? ` +${p.targetCrops.length - 3}` : ''}
                  </TD>
                  <TD className="text-xs text-neutral-500">{p.manufacturer ?? '—'}</TD>
                </TR>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      <p className="mt-4 text-xs text-neutral-500">
        Datos basados en el Registro Nacional de Plaguicidas Químicos de Uso Agrícola del ICA. Verificá contra la última base ICA antes de uso comercial.
      </p>
    </div>
  );
}
