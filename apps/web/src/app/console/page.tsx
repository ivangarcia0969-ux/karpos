import { Card, CardContent, CardHeader, CardTitle, PageHeader } from '@karpos/ui';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader title="Tablero" description="Indicadores clave del operativo de hoy." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Predios activos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-karpos-leaf">3</p>
            <p className="text-sm text-karpos-bark/60">de 3 totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lotes con PHI activo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-karpos-clay">2</p>
            <p className="text-sm text-karpos-bark/60">no cosechar hoy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cosecha del día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl">0 kg</p>
            <p className="text-sm text-karpos-bark/60">aún sin pesajes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alertas abiertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl text-warning">5</p>
            <p className="text-sm text-karpos-bark/60">3 sanitarias · 2 climáticas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
