'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/client-api';

export const phenoKeys = {
  events: (plotId: string) => ['phenology', 'events', plotId] as const,
  gdd: (plotId: string, from: string, to: string) => ['phenology', 'gdd', plotId, from, to] as const,
};

export function usePhenologyEvents(plotId: string) {
  return useQuery({
    queryKey: phenoKeys.events(plotId),
    queryFn: () => clientApi.listPhenologyEvents(plotId),
    enabled: !!plotId,
  });
}

export function useGdd(plotId: string, from: string, to: string) {
  return useQuery({
    queryKey: phenoKeys.gdd(plotId, from, to),
    queryFn: () => clientApi.computeGdd({ plotId, from, to }),
    enabled: !!plotId && !!from && !!to,
  });
}

export function useRecordPhenologyEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.recordPhenologyEvent(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['phenology'] }),
  });
}
