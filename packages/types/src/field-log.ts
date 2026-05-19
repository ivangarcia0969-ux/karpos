import { z } from 'zod';

export const FieldOperationSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  operationType: z.string(),
  startedAt: z.string(),
  endedAt: z.string().nullable().optional(),
  areaHa: z.union([z.string(), z.number()]).nullable().optional(),
  notes: z.string().nullable().optional(),
  inputs: z.array(z.record(z.unknown())),
  recordedBy: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});
export type FieldOperation = z.infer<typeof FieldOperationSchema>;
