import { z } from 'zod';

export const PestScoutingSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  observedAt: z.string(),
  pestTaxonId: z.string().uuid(),
  severityScale: z.string(),
  severityValue: z.string().nullable().optional(),
  incidencePct: z.string().nullable().optional(),
  source: z.enum(['manual', 'vision', 'trap']),
  createdAt: z.string(),
});
export type PestScouting = z.infer<typeof PestScoutingSchema>;

export const SprayRecordSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  appliedAt: z.string(),
  finishedAt: z.string().nullable().optional(),
  applicatorName: z.string().nullable().optional(),
  applicatorLicense: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
  areaTreatedHa: z.string().nullable().optional(),
  phiUntil: z.string().nullable().optional(),
  reiUntil: z.string().nullable().optional(),
  status: z.enum(['planned', 'applied', 'voided']),
  voidedReason: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type SprayRecord = z.infer<typeof SprayRecordSchema>;
