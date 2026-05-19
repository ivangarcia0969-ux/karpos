import { z } from 'zod';
import { PointSchema } from './core.js';

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
  totalAreaHa: z.union([z.string(), z.number()]).nullable().optional(),
  centroid: PointSchema.nullable().optional(),
  boundary: z.unknown().nullable().optional(),
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
  code: z.string(),
  name: z.string(),
  speciesId: z.string().uuid().nullable().optional(),
  varietyId: z.string().uuid().nullable().optional(),
  plantingDate: z.string().nullable().optional(),
  spacingRowM: z.union([z.string(), z.number()]).nullable().optional(),
  spacingTreeM: z.union([z.string(), z.number()]).nullable().optional(),
  treesCount: z.number().int().nullable().optional(),
  areaHa: z.union([z.string(), z.number()]).nullable().optional(),
  boundary: z.unknown().nullable().optional(),
  centroid: PointSchema.nullable().optional(),
  status: z.string(),
  metadata: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Plot = z.infer<typeof PlotSchema>;
