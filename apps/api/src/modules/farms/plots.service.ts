import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { plots } from '../../database/schema/farms.js';
import type { Principal } from '../../iam/auth.service.js';

export const CreatePlotSchema = z.object({
  farmId: z.string().uuid(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  speciesId: z.string().uuid().optional(),
  varietyId: z.string().uuid().optional(),
  plantingDate: z.string().date().optional(),
  spacingRowM: z.number().positive().optional(),
  spacingTreeM: z.number().positive().optional(),
  treesCount: z.number().int().nonnegative().optional(),
  areaHa: z.number().positive().optional(),
  boundary: z.unknown().optional(),
  centroid: z.object({ lat: z.number(), lng: z.number() }).optional(),
  status: z.enum(['active', 'fallow', 'removed']).default('active'),
  metadata: z.record(z.unknown()).default({}),
});
export type CreatePlotDto = z.infer<typeof CreatePlotSchema>;

export const UpdatePlotSchema = CreatePlotSchema.partial().omit({ farmId: true });
export type UpdatePlotDto = z.infer<typeof UpdatePlotSchema>;

@Injectable()
export class PlotsService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(principal: Principal, farmId?: string) {
    const conditions = [eq(plots.orgId, principal.orgId)];
    if (farmId) conditions.push(eq(plots.farmId, farmId));
    return this.db
      .select()
      .from(plots)
      .where(and(...conditions))
      .orderBy(desc(plots.createdAt))
      .limit(500);
  }

  async get(principal: Principal, id: string) {
    const [row] = await this.db
      .select()
      .from(plots)
      .where(and(eq(plots.orgId, principal.orgId), eq(plots.id, id)));
    if (!row) throw new NotFoundException('plot_not_found');
    return row;
  }

  async create(principal: Principal, dto: CreatePlotDto) {
    const [row] = await this.db
      .insert(plots)
      .values({
        orgId: principal.orgId,
        farmId: dto.farmId,
        code: dto.code,
        name: dto.name,
        speciesId: dto.speciesId,
        varietyId: dto.varietyId,
        plantingDate: dto.plantingDate,
        spacingRowM: dto.spacingRowM?.toString(),
        spacingTreeM: dto.spacingTreeM?.toString(),
        treesCount: dto.treesCount,
        areaHa: dto.areaHa?.toString(),
        boundary: dto.boundary as Record<string, unknown> | undefined,
        centroid: dto.centroid as Record<string, unknown> | undefined,
        status: dto.status,
        metadata: dto.metadata,
      })
      .returning();
    return row;
  }

  async update(principal: Principal, id: string, dto: UpdatePlotDto) {
    const [row] = await this.db
      .update(plots)
      .set({
        ...(dto.code !== undefined && { code: dto.code }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.speciesId !== undefined && { speciesId: dto.speciesId }),
        ...(dto.varietyId !== undefined && { varietyId: dto.varietyId }),
        ...(dto.plantingDate !== undefined && { plantingDate: dto.plantingDate }),
        ...(dto.spacingRowM !== undefined && { spacingRowM: dto.spacingRowM.toString() }),
        ...(dto.spacingTreeM !== undefined && { spacingTreeM: dto.spacingTreeM.toString() }),
        ...(dto.treesCount !== undefined && { treesCount: dto.treesCount }),
        ...(dto.areaHa !== undefined && { areaHa: dto.areaHa.toString() }),
        ...(dto.boundary !== undefined && { boundary: dto.boundary as Record<string, unknown> }),
        ...(dto.centroid !== undefined && { centroid: dto.centroid as Record<string, unknown> }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        updatedAt: new Date(),
      })
      .where(and(eq(plots.orgId, principal.orgId), eq(plots.id, id)))
      .returning();
    if (!row) throw new NotFoundException('plot_not_found');
    return row;
  }

  async remove(principal: Principal, id: string) {
    const [row] = await this.db
      .delete(plots)
      .where(and(eq(plots.orgId, principal.orgId), eq(plots.id, id)))
      .returning({ id: plots.id });
    if (!row) throw new NotFoundException('plot_not_found');
    return { ok: true };
  }
}
