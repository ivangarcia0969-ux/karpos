'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientApi } from '@/lib/client-api';

export const fieldOpKeys = {
  all: ['field-ops'] as const,
  list: (plotId?: string, from?: string, to?: string) =>
    [...fieldOpKeys.all, plotId, from, to] as const,
};

export function useFieldOperations(opts?: { plotId?: string; from?: string; to?: string; pageSize?: number }) {
  return useQuery({
    queryKey: fieldOpKeys.list(opts?.plotId, opts?.from, opts?.to),
    queryFn: () => clientApi.listFieldOperations(opts),
  });
}

export function useLogFieldOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => clientApi.logFieldOperation(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: fieldOpKeys.all }),
  });
}
