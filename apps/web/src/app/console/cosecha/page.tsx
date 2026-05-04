import { PageHeader, Button, Card, CardContent, CardHeader, CardTitle } from '@karpos/ui';
import { Plus } from 'lucide-react';

export default function CosechaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cosecha360"
        description="Plan, pesajes y trazabilidad lote a pallet."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Abrir lote de cosecha
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Cosecha del día</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">0 kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Acumulado temporada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl">12,420 kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Forecast cierre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-karpos-leaf">68 t</p>
            <p className="text-sm text-karpos-bark/70">±9% IC al 95%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
