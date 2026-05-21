import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { pestScoutings, sprayRecords } from '../../database/schema/health.js';
import type { Principal } from '../../iam/auth.service.js';

export const RecordScoutingSchema = z.object({
  plotId: z.string().uuid(),
  observedOn: z.string().date(),
  target: z.string().min(1).max(120),
  category: z.enum(['pest', 'disease', 'weed', 'beneficial', 'abiotic']),
  severity: z.enum(['none', 'low', 'moderate', 'high', 'severe']),
  incidencePct: z.number().min(0).max(100).optional(),
  sampleSize: z.number().int().nonnegative().optional(),
  stageBbch: z.string().max(6).optional(),
  notes: z.string().max(2000).optional(),
  photos: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});
export type RecordScoutingDto = z.infer<typeof RecordScoutingSchema>;

export const RecordSpraySchema = z.object({
  plotId: z.string().uuid(),
  scoutingId: z.string().uuid().optional(),
  fitoProductId: z.string().uuid().optional(),
  appliedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  operator: z.string().min(1).max(120),
  target: z.string().max(120).optional(),
  productName: z.string().min(1).max(120),
  activeIngredient: z.string().min(1).max(180),
  registrationNo: z.string().max(60).optional(),
  doseAmount: z.number().positive(),
  doseUnit: z.string().min(1).max(20),
  waterLPerHa: z.number().positive().optional(),
  areaHa: z.number().positive(),
  phiDays: z.number().int().nonnegative(),
  reiHours: z.number().int().nonnegative().optional(),
  equipment: z.string().max(120).optional(),
  windKmh: z.number().nonnegative().optional(),
  tempC: z.number().optional(),
  rhPct: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).default({}),
});
export type RecordSprayDto = z.infer<typeof RecordSpraySchema>;

@Injectable()
export class HealthService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  listScoutings(principal: Principal, plotId: string) {
    return this.db
      .select()
      .from(pestScoutings)
      .where(and(eq(pestScoutings.orgId, principal.orgId), eq(pestScoutings.plotId, plotId)))
      .orderBy(desc(pestScoutings.observedOn))
      .limit(500);
  }

  async recordScouting(principal: Principal, dto: RecordScoutingDto) {
    const [row] = await this.db
      .insert(pestScoutings)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        observedOn: dto.observedOn,
        target: dto.target,
        category: dto.category,
        severity: dto.severity,
        incidencePct: dto.incidencePct?.toString(),
        sampleSize: dto.sampleSize,
        stageBbch: dto.stageBbch,
        notes: dto.notes,
        photos: dto.photos,
        metadata: dto.metadata,
        observerId: principal.userId,
      })
      .returning();
    return row;
  }

  listSprays(principal: Principal, plotId?: string) {
    const conds = [eq(sprayRecords.orgId, principal.orgId), isNull(sprayRecords.voidedAt)];
    if (plotId) conds.push(eq(sprayRecords.plotId, plotId));
    return this.db
      .select()
      .from(sprayRecords)
      .where(and(...conds))
      .orderBy(desc(sprayRecords.appliedAt))
      .limit(500);
  }

  async recordSpray(principal: Principal, dto: RecordSprayDto) {
    const [row] = await this.db
      .insert(sprayRecords)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        scoutingId: dto.scoutingId,
        fitoProductId: dto.fitoProductId,
        appliedAt: new Date(dto.appliedAt),
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
        operator: dto.operator,
        target: dto.target,
        productName: dto.productName,
        activeIngredient: dto.activeIngredient,
        registrationNo: dto.registrationNo,
        doseAmount: dto.doseAmount.toString(),
        doseUnit: dto.doseUnit,
        waterLPerHa: dto.waterLPerHa?.toString(),
        areaHa: dto.areaHa.toString(),
        phiDays: dto.phiDays,
        reiHours: dto.reiHours,
        equipment: dto.equipment,
        windKmh: dto.windKmh?.toString(),
        tempC: dto.tempC?.toString(),
        rhPct: dto.rhPct?.toString(),
        notes: dto.notes,
        metadata: dto.metadata,
        recordedBy: principal.userId,
      })
      .returning();
    return row;
  }

  async voidSpray(principal: Principal, id: string, reason: string) {
    if (!reason || reason.trim().length < 3) {
      throw new BadRequestException('void_reason_required');
    }
    const [row] = await this.db
      .update(sprayRecords)
      .set({
        voidedAt: new Date(),
        voidedBy: principal.userId,
        voidReason: reason,
      })
      .where(
        and(
          eq(sprayRecords.orgId, principal.orgId),
          eq(sprayRecords.id, id),
          isNull(sprayRecords.voidedAt),
        ),
      )
      .returning();
    if (!row) throw new NotFoundException('spray_not_found_or_already_voided');
    return row;
  }
}
