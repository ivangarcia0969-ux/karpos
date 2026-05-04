import { PageHeader, Card, CardContent, CardHeader, CardTitle } from '@karpos/ui';

export default function FenoflowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Fenoflow"
        description="Estados BBCH y grados-día acumulados por lote."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Etapa actual estimada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-karpos-leaf">BBCH 71</p>
            <p className="text-sm text-karpos-bark/70">Cuajado · Cuartel Malbec Alto</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Grados-día acumulados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">682.3°D</p>
            <p className="text-sm text-karpos-bark/70">Base 10°C · método triángulo simple</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
