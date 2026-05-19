import { z } from 'zod';

export const PhenologyEventSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  observedOn: z.string(),
  bbchCode: z.string(),
  stageLabel: z.string().nullable().optional(),
  pctInStage: z.union([z.string(), z.number()]).nullable().optional(),
  notes: z.string().nullable().optional(),
  recordedBy: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});
export type PhenologyEvent = z.infer<typeof PhenologyEventSchema>;
