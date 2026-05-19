import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { farms, plots } from '../../database/schema/farms.js';
import type { Principal } from '../../iam/auth.service.js';

export const CreateFarmSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  countryCode: z.string().length(2).toUpperCase(),
  region: z.string().max(120).optional(),
  locality: z.string().max(120).optional(),
  timezone: z.string().min(1).default('America/Bogota'),
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

@Injectable()
export class FarmsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(principal: Principal, query: ListFarmsQuery) {
    const conditions = [eq(farms.orgId, principal.orgId)];
    if (query.q) {
      conditions.push(or(ilike(farms.name, `%${query.q}%`), ilike(farms.code, `%${query.q}%`))!);
    }
    const offset = (query.page - 1) * query.pageSize;
    const [rows, [{ count }]] = await Promise.all([
      this.db
        .select()
        .from(farms)
        .where(and(...conditions))
        .orderBy(desc(farms.createdAt))
        .limit(query.pageSize)
        .offset(offset),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(farms)
        .where(and(...conditions)),
    ]);
    return { rows, total: count, page: query.page, pageSize: query.pageSize };
  }

  async get(principal: Principal, id: string) {
    const [row] = await this.db
      .select()
      .from(farms)
      .where(and(eq(farms.orgId, principal.orgId), eq(farms.id, id)));
    if (!row) throw new NotFoundException('farm_not_found');
    return row;
  }

  async create(principal: Principal, dto: CreateFarmDto) {
    const [row] = await this.db
      .insert(farms)
      .values({
        orgId: principal.orgId,
        code: dto.code,
        name: dto.name,
        countryCode: dto.countryCode,
        region: dto.region,
        locality: dto.locality,
        timezone: dto.timezone,
        elevationM: dto.elevationM,
        totalAreaHa: dto.totalAreaHa?.toString(),
        centroid: dto.centroid as Record<string, unknown> | undefined,
        boundary: dto.boundary as Record<string, unknown> | undefined,
        contact: dto.contact,
        metadata: dto.metadata,
      })
      .returning();
    return row;
  }

  async update(principal: Principal, id: string, dto: UpdateFarmDto) {
    const [row] = await this.db
      .update(farms)
      .set({
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.countryCode !== undefined && { countryCode: dto.countryCode }),
        ...(dto.region !== undefined && { region: dto.region }),
        ...(dto.locality !== undefined && { locality: dto.locality }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
        ...(dto.elevationM !== undefined && { elevationM: dto.elevationM }),
        ...(dto.totalAreaHa !== undefined && { totalAreaHa: dto.totalAreaHa.toString() }),
        ...(dto.centroid !== undefined && { centroid: dto.centroid as Record<string, unknown> }),
        ...(dto.boundary !== undefined && { boundary: dto.boundary as Record<string, unknown> }),
        ...(dto.contact !== undefined && { contact: dto.contact }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        updatedAt: new Date(),
      })
      .where(and(eq(farms.orgId, principal.orgId), eq(farms.id, id)))
      .returning();
    if (!row) throw new NotFoundException('farm_not_found');
    return row;
  }

  async remove(principal: Principal, id: string) {
    const [row] = await this.db
      .delete(farms)
      .where(and(eq(farms.orgId, principal.orgId), eq(farms.id, id)))
      .returning({ id: farms.id });
    if (!row) throw new NotFoundException('farm_not_found');
    return { ok: true };
  }
}
