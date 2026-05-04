import { z } from 'zod';

export const FieldOperationSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  operationTypeId: z.string().uuid(),
  performedAt: z.string(),
  finishedAt: z.string().nullable().optional(),
  crewId: z.string().uuid().nullable().optional(),
  workersCount: z.number().int().nullable().optional(),
  areaCoveredHa: z.string().nullable().optional(),
  outputQuantity: z.string().nullable().optional(),
  outputUnit: z.string().nullable().optional(),
  costAmount: z.string().nullable().optional(),
  costCurrency: z.string().length(3).nullable().optional(),
  notes: z.string().nullable().optional(),
  attachments: z.array(z.unknown()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});
export type FieldOperation = z.infer<typeof FieldOperationSchema>;
