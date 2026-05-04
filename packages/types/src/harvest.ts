import { z } from 'zod';

export const HarvestPlanSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  seasonYear: z.number().int(),
  plotId: z.string().uuid(),
  expectedYieldKg: z.string().nullable().optional(),
  expectedYieldKgHa: z.string().nullable().optional(),
  status: z.enum(['draft', 'approved', 'active', 'closed']),
  createdAt: z.string(),
});
export type HarvestPlan = z.infer<typeof HarvestPlanSchema>;

export const HarvestLotSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  plotId: z.string().uuid(),
  lotCode: z.string(),
  harvestedOn: z.string(),
  grossKg: z.string(),
  tareKg: z.string(),
  netKg: z.string().nullable().optional(),
  status: z.enum(['open', 'closed', 'dispatched', 'voided']),
  createdAt: z.string(),
});
export type HarvestLot = z.infer<typeof HarvestLotSchema>;
