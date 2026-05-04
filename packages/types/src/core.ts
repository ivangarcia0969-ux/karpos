import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;

export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export const PageOf = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    rows: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });

export const PointSchema = z.object({ lat: z.number(), lng: z.number() });
export type Point = z.infer<typeof PointSchema>;

export const PrincipalSchema = z.object({
  userId: z.string().uuid(),
  orgId: z.string().uuid(),
  email: z.string().email(),
  permissions: z.array(z.string()),
  roles: z.array(z.string()),
});
export type Principal = z.infer<typeof PrincipalSchema>;

export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string().optional(),
  issues: z.array(z.unknown()).optional(),
  path: z.string().optional(),
  method: z.string().optional(),
  timestamp: z.string().optional(),
  requestId: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export type Locale = 'es-CO' | 'es-MX' | 'es-ES' | 'es-AR' | 'es-CL' | 'en-US' | 'pt-BR';
