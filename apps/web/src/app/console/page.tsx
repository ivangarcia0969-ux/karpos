'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, PageHeader, Spinner } from '@karpos/ui';
import { Trees, Scale, Bell, Wheat } from 'lucide-react';

interface Summary {
  activeFarms: number;
  activeHarvestPlans: number;
  alertsOpen: number;
  harvestKgToday: number;
}

function useDashboardSummary() {
  return useQuery<Summary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/summary');
      if (!res.ok) throw new Error('Failed to fetch summary');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

function Stat({
  title,
  value,
  sub,
  icon: Icon,
  colorClass = '',
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  colorClass?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-karpos-bark/50" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`font-display text-4xl ${colorClass || 'text-karpos-leaf'}`}>{value}</p>
        {sub && <p className="mt-1 text-sm text-karpos-bark/60">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div className="space-y-8">
      <PageHeader title="Tablero" description="Indicadores clave del operativo de hoy." />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            title="Predios activos"
            icon={Trees}
            value={data?.activeFarms ?? 0}
            sub={`de ${data?.activeFarms ?? 0} totales`}
          />
          <Stat
            title="Planes cosecha activos"
            icon={Wheat}
            value={data?.activeHarvestPlans ?? 0}
            sub={`temporada ${new Date().getFullYear()}`}
          />
          <Stat
            title="Cosecha del día"
            icon={Scale}
            value={data?.harvestKgToday ? `${data.harvestKgToday.toLocaleString('es-CO')} kg` : '0 kg'}
            sub="pesajes registrados hoy"
            colorClass=""
          />
          <Stat
            title="Alertas abiertas"
            icon={Bell}
            value={data?.alertsOpen ?? 0}
            sub="sanitarias y climáticas"
            colorClass={data?.alertsOpen ? 'text-karpos-clay' : ''}
          />
        </div>
      )}
    </div>
  );
}
