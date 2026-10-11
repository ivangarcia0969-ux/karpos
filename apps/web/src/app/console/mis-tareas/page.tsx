import { PageHeader, Card, Badge, Button } from '@karpos/ui';
import { Play, Square } from 'lucide-react';

export default function MisTareasPage() {
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <PageHeader
        title="Mis Tareas"
        description="Tareas asignadas pendientes de ejecución."
      />
      
      {/* Mobile-first approach for operators */}
      <div className="space-y-4">
        <Card className="p-5 border-l-4 border-l-brand-600">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Raleo Manual</h3>
              <p className="text-sm text-neutral-500">Lote L12 • Durazno</p>
            </div>
            <Badge variant="info">NUEVA</Badge>
          </div>
          <div className="bg-neutral-50 rounded-md p-3 mb-4 text-sm text-neutral-600">
            <strong>Instrucciones:</strong> Ralear dejando 1 fruto cada 15cm. Cuidado con las yemas.
          </div>
          <Button variant="primary" className="w-full py-6 text-lg font-medium flex items-center justify-center gap-2">
            <Play className="w-5 h-5 fill-current" /> INICIAR LABOR
          </Button>
        </Card>

        <Card className="p-5 border-l-4 border-l-warning-500">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Aplicación Foliar Calcio</h3>
              <p className="text-sm text-neutral-500">Lote L05 • Manzana</p>
            </div>
            <Badge variant="warning">EN EJECUCIÓN</Badge>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Área: 1.2 ha de 3.0 ha</span>
              <span className="font-medium text-brand-600">40%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 py-4 font-medium">REPORTAR AVANCE</Button>
            <Button variant="danger" className="flex-1 py-4 font-medium flex items-center justify-center gap-2">
              <Square className="w-4 h-4 fill-current" /> FINALIZAR
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
