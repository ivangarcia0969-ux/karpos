'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/client-api';

export const harvestKeys = {
  plans: (year?: number) => ['harvest', 'plans', year] as const,
  lots: ['harvest', 'lots'] as const,
};

export function useHarvestPlans(seasonYear?: number) {
  return useQuery({
    queryKey: harvestKeys.plans(seasonYear),
    queryFn: () => clientApi.listHarvestPlans(seasonYear),
  });
}

export function useCreateHarvestPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.createHarvestPlan(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['harvest'] }),
  });
}

export function useRecordHarvestLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.recordHarvestLot(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['harvest'] }),
  });
}

export function useRecordWeighbridgeTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.recordWeighbridgeTicket(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['harvest'] }),
  });
}
