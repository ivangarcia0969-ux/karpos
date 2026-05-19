import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { harvestLots, harvestPlans } from '../../database/schema/harvest.js';
import type { Principal } from '../../iam/auth.service.js';

export const CreateHarvestPlanSchema = z.object({
  plotId: z.string().uuid(),
  seasonYear: z.number().int().min(2000).max(2200),
  expectedStartDate: z.string().date().optional(),
  expectedEndDate: z.string().date().optional(),
  expectedYieldKg: z.number().positive().optional(),
  expectedYieldKgHa: z.number().positive().optional(),
  forecastMethod: z.string().max(60).optional(),
  forecastMetadata: z.record(z.unknown()).default({}),
  notes: z.string().max(2000).optional(),
});
export type CreateHarvestPlanDto = z.infer<typeof CreateHarvestPlanSchema>;

export const RecordHarvestLotSchema = z.object({
  plotId: z.string().uuid(),
  planId: z.string().uuid().optional(),
  lotCode: z.string().min(1).max(40),
  harvestedOn: z.string().date(),
  varietyId: z.string().uuid().optional(),
  grossKg: z.number().nonnegative().optional(),
  tareKg: z.number().nonnegative().default(0),
  netWeightKg: z.number().nonnegative().optional(),
  containersCount: z.number().int().nonnegative().optional(),
  qualityGrade: z.string().max(20).optional(),
  destination: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).default({}),
});
export type RecordHarvestLotDto = z.infer<typeof RecordHarvestLotSchema>;

@Injectable()
export class HarvestService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  listPlans(principal: Principal, seasonYear?: number) {
    const conds = [eq(harvestPlans.orgId, principal.orgId)];
    if (seasonYear) conds.push(eq(harvestPlans.seasonYear, seasonYear));
    return this.db
      .select()
      .from(harvestPlans)
      .where(and(...conds))
      .orderBy(desc(harvestPlans.createdAt))
      .limit(500);
  }

  async createPlan(principal: Principal, dto: CreateHarvestPlanDto) {
    const [row] = await this.db
      .insert(harvestPlans)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        seasonYear: dto.seasonYear,
        expectedStartDate: dto.expectedStartDate,
        expectedEndDate: dto.expectedEndDate,
        expectedYieldKg: dto.expectedYieldKg?.toString(),
        expectedYieldKgHa: dto.expectedYieldKgHa?.toString(),
        forecastMethod: dto.forecastMethod,
        forecastMetadata: dto.forecastMetadata,
        notes: dto.notes,
        recordedBy: principal.userId,
      })
      .returning();
    return row;
  }

  listLots(principal: Principal, plotId?: string) {
    const conds = [eq(harvestLots.orgId, principal.orgId)];
    if (plotId) conds.push(eq(harvestLots.plotId, plotId));
    return this.db
      .select()
      .from(harvestLots)
      .where(and(...conds))
      .orderBy(desc(harvestLots.harvestedOn))
      .limit(500);
  }

  async recordLot(principal: Principal, dto: RecordHarvestLotDto) {
    const [row] = await this.db
      .insert(harvestLots)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        planId: dto.planId,
        lotCode: dto.lotCode,
        harvestedOn: dto.harvestedOn,
        varietyId: dto.varietyId,
        grossKg: dto.grossKg?.toString(),
        tareKg: dto.tareKg.toString(),
        netWeightKg: dto.netWeightKg?.toString(),
        containersCount: dto.containersCount,
        qualityGrade: dto.qualityGrade,
        destination: dto.destination,
        notes: dto.notes,
        metadata: dto.metadata,
        recordedBy: principal.userId,
      })
      .returning();
    return row;
  }

  async voidLot(principal: Principal, id: string) {
    const [row] = await this.db
      .delete(harvestLots)
      .where(and(eq(harvestLots.orgId, principal.orgId), eq(harvestLots.id, id)))
      .returning({ id: harvestLots.id });
    if (!row) throw new NotFoundException('lot_not_found');
    return { ok: true };
  }
}
