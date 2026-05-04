import { z } from 'zod';

export const CreateFarmSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  countryCode: z.string().length(2).toUpperCase(),
  region: z.string().max(120).optional(),
  locality: z.string().max(120).optional(),
  timezone: z.string().min(1),
  elevationM: z.number().int().optional(),
  totalAreaHa: z.number().positive().optional(),
  centroid: z.object({ lat: z.number(), lng: z.number() }).optional(),
  boundary: z.unknown().optional(),
  contact: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
});
export type CreateFarmDto = z.infer<typeof CreateFarmSchema>;

export const UpdateFarmSchema = CreateFarmSchema.partial();
export type UpdateFarmDto = z.infer<typeof UpdateFarmSchema>;

export const ListFarmsQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type ListFarmsQuery = z.infer<typeof ListFarmsQuerySchema>;
