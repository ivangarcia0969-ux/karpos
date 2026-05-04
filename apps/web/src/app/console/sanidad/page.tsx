import { PageHeader, Button, Badge, Card, CardContent } from '@karpos/ui';
import { Plus } from 'lucide-react';

export default function SanidadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sanidad+"
        description="Monitoreo, aplicaciones y carencia (PHI/REI)."
        actions={
          <>
            <Button variant="outline">Nuevo monitoreo</Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar aplicación
            </Button>
          </>
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg">Lotes en periodo de carencia</p>
              <p className="text-sm text-karpos-bark/70">No cosechar hasta nueva orden</p>
            </div>
            <Badge tone="clay">2 lotes</Badge>
          </div>
          <ul className="divide-y divide-karpos-fog text-sm">
            <li className="flex items-center justify-between py-2">
              <span>Cuartel Malbec Alto</span>
              <span className="text-karpos-bark/70">PHI hasta 2026-05-12</span>
            </li>
            <li className="flex items-center justify-between py-2">
              <span>Lote Hass Norte</span>
              <span className="text-karpos-bark/70">PHI hasta 2026-05-09</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
