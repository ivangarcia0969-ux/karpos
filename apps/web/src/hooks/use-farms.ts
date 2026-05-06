'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/client-api';
import type { Farm } from '@karpos/types';

export const farmKeys = {
  all: ['farms'] as const,
  list: (q?: string) => [...farmKeys.all, 'list', q] as const,
  detail: (id: string) => [...farmKeys.all, 'detail', id] as const,
  plots: (farmId: string) => [...farmKeys.all, 'plots', farmId] as const,
};

export function useFarms(q?: string) {
  return useQuery({
    queryKey: farmKeys.list(q),
    queryFn: () => clientApi.listFarms({ q, pageSize: 100 }),
  });
}

export function useFarm(id: string) {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: () => clientApi.getFarm(id),
    enabled: !!id,
  });
}

export function usePlots(farmId: string) {
  return useQuery({
    queryKey: farmKeys.plots(farmId),
    queryFn: () => clientApi.listPlots(farmId),
    enabled: !!farmId,
  });
}

export function useAllPlots() {
  return useQuery({
    queryKey: [...farmKeys.all, 'all-plots'],
    queryFn: () => clientApi.listPlots(),
  });
}

export function useCreateFarm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Farm> & { code: string; name: string; countryCode: string; timezone: string }) =>
      clientApi.createFarm(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: farmKeys.all }),
  });
}
