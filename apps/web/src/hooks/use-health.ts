'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/client-api';

export const healthKeys = {
  scoutings: (plotId: string) => ['health', 'scoutings', plotId] as const,
  sprays: ['health', 'sprays'] as const,
};

export function useScoutings(plotId: string) {
  return useQuery({
    queryKey: healthKeys.scoutings(plotId),
    queryFn: () => clientApi.listScoutings(plotId),
    enabled: !!plotId,
  });
}

export function useRecordScouting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.recordScouting(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health'] }),
  });
}

export function useRecordSpray() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.recordSpray(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health'] }),
  });
}

export function useVoidSpray() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => clientApi.voidSpray(id, reason),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health'] }),
  });
}
