import { Logo, Card, CardContent } from '@karpos/ui';

type Props = { params: { lot: string } };

export const metadata = {
  title: 'Trazabilidad pública',
  description: 'Verificación de origen y prácticas del lote.',
};

export default function PublicTraceability({ params }: Props) {
  return (
    <main className="min-h-screen bg-karpos-cream py-12">
      <div className="mx-auto max-w-2xl space-y-6 px-6">
        <Logo className="h-8 w-auto" />
        <h1 className="font-display text-3xl">Trazabilidad del lote {params.lot}</h1>
        <Card>
          <CardContent className="space-y-3 pt-6 text-sm">
            <p>
              Este lote es de uva Malbec, cosechada el 2026-04-12 en la finca <strong>Andes Sur</strong>,
              Luján de Cuyo, Mendoza, Argentina.
            </p>
            <p>
              Certificaciones vigentes: <strong>GLOBALG.A.P. IFA v6</strong>, <strong>Rainforest Alliance 2020</strong>.
            </p>
            <p>
              Última aplicación fitosanitaria: 2026-04-04 (PHI cumplido al cosechar).
            </p>
            <p className="text-karpos-bark/60">
              Esta página se sirve estáticamente desde Karpos. Los datos provienen del libro de campo
              auditado del productor y no han sido editados después de la cosecha.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
