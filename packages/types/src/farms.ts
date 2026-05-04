import { z } from 'zod';
import { PointSchema } from './core.js';

export const FarmStatusSchema = z.enum(['planning', 'establishing', 'active', 'retired']);

export const FarmSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  countryCode: z.string().length(2),
  region: z.string().nullable().optional(),
  locality: z.string().nullable().optional(),
  timezone: z.string(),
  elevationM: z.number().int().nullable().optional(),
  totalAreaHa: z.string().nullable().optional(),
  contact: z.record(z.unknown()),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Farm = z.infer<typeof FarmSchema>;

export const PlotSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  farmId: z.string().uuid(),
  sectorId: z.string().uuid().nullable().optional(),
  code: z.string(),
  name: z.string(),
  speciesId: z.string().uuid(),
  varietyId: z.string().uuid().nullable().optional(),
  rootstockId: z.string().uuid().nullable().optional(),
  trainingSystemId: z.string().uuid().nullable().optional(),
  plantingDate: z.string().nullable().optional(),
  spacingRowM: z.string().nullable().optional(),
  spacingTreeM: z.string().nullable().optional(),
  treesCount: z.number().int().nullable().optional(),
  areaHa: z.string().nullable().optional(),
  status: FarmStatusSchema,
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Plot = z.infer<typeof PlotSchema>;
