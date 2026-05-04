import { PageHeader, Button, EmptyState } from '@karpos/ui';
import { Plus } from 'lucide-react';

export default function BitacoraPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora Verde"
        description="Registro de labores culturales por lote y cuadrilla."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Registrar labor
          </Button>
        }
      />
      <EmptyState
        title="Sin labores registradas"
        description="Cada labor — poda, raleo, riego, cosecha — se registra aquí con tiempo, área y rendimiento."
        action={<Button>Registrar labor</Button>}
      />
    </div>
  );
}
