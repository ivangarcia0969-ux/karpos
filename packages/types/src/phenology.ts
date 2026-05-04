import { z } from 'zod';

export const PhenologyEventSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  observedAt: z.string(),
  bbchCode: z.string().regex(/^\d{2}$/),
  observedPct: z.string().nullable().optional(),
  observerId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
  source: z.enum(['manual', 'satellite', 'model', 'imported']),
  createdAt: z.string(),
});
export type PhenologyEvent = z.infer<typeof PhenologyEventSchema>;

export const GddDailySchema = z.object({
  observed_on: z.string(),
  tmin_c: z.string().nullable(),
  tmax_c: z.string().nullable(),
  gdd: z.string(),
  cumulative_gdd: z.string().nullable(),
});
export type GddDaily = z.infer<typeof GddDailySchema>;
