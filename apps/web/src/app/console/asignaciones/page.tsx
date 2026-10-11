import { PageHeader, Card, Badge, Button } from '@karpos/ui';

export default function AsignacionesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaciones en Campo"
        description="Gestione las órdenes de trabajo y asigne tareas a los operarios."
        actions={
          <Button variant="primary">Nueva Asignación</Button>
        }
      />
      
      {/* Mobile-cards / Desktop-table pattern adapted from AgroControl */}
      <div className="grid gap-4 md:hidden">
        {/* Mobile cards */}
        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-neutral-900">Aplicación Fertilizante NPK</p>
              <p className="text-sm text-neutral-500">Lote: L01 - Manzano Gala</p>
            </div>
            <Badge variant="warning">EN EJECUCIÓN</Badge>
          </div>
          <div className="text-sm">
            <span className="font-medium text-neutral-700">Operario:</span> Juan Pérez
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-neutral-900">Poda de Formación</p>
              <p className="text-sm text-neutral-500">Lote: L04 - Cerezo</p>
            </div>
            <Badge variant="success">FINALIZADO</Badge>
          </div>
          <div className="text-sm">
            <span className="font-medium text-neutral-700">Operario:</span> Carlos Gómez
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="w-full text-xs py-1">Ver Recibo</Button>
            <Button variant="primary" className="w-full text-xs py-1">Firmar</Button>
          </div>
        </Card>
      </div>

      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-900">
              <tr>
                <th className="p-4 font-semibold">Labor</th>
                <th className="p-4 font-semibold">Lote</th>
                <th className="p-4 font-semibold">Operario</th>
                <th className="p-4 font-semibold">Progreso</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-medium text-neutral-900">Aplicación Fertilizante NPK</td>
                <td className="p-4">L01 - Manzano Gala</td>
                <td className="p-4">Juan Pérez</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-neutral-200 rounded-full h-2">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-xs">45%</span>
                  </div>
                </td>
                <td className="p-4"><Badge variant="warning">EN EJECUCIÓN</Badge></td>
                <td className="p-4 text-right">
                  <Button variant="secondary" className="px-3 py-1">Detalle</Button>
                </td>
              </tr>
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-medium text-neutral-900">Poda de Formación</td>
                <td className="p-4">L04 - Cerezo</td>
                <td className="p-4">Carlos Gómez</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-neutral-200 rounded-full h-2">
                      <div className="bg-success-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs">100%</span>
                  </div>
                </td>
                <td className="p-4"><Badge variant="success">FINALIZADO</Badge></td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <Button variant="secondary" className="px-3 py-1">Ver Recibo</Button>
                  <Button variant="primary" className="px-3 py-1">Firmar</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
