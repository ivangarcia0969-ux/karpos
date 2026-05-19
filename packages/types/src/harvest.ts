import { z } from 'zod';

export const HarvestPlanSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  seasonYear: z.number().int(),
  expectedStartDate: z.string().nullable().optional(),
  expectedEndDate: z.string().nullable().optional(),
  expectedYieldKg: z.union([z.string(), z.number()]).nullable().optional(),
  expectedYieldKgHa: z.union([z.string(), z.number()]).nullable().optional(),
  forecastMethod: z.string().nullable().optional(),
  forecastMetadata: z.record(z.unknown()),
  status: z.string(),
  notes: z.string().nullable().optional(),
  recordedBy: z.string().uuid().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type HarvestPlan = z.infer<typeof HarvestPlanSchema>;

export const HarvestLotSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  planId: z.string().uuid().nullable().optional(),
  lotCode: z.string(),
  harvestedOn: z.string(),
  varietyId: z.string().uuid().nullable().optional(),
  netWeightKg: z.union([z.string(), z.number()]).nullable().optional(),
  grossKg: z.union([z.string(), z.number()]).nullable().optional(),
  tareKg: z.union([z.string(), z.number()]).nullable().optional(),
  containersCount: z.number().int().nullable().optional(),
  qualityGrade: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  recordedBy: z.string().uuid().nullable().optional(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
});
export type HarvestLot = z.infer<typeof HarvestLotSchema>;
