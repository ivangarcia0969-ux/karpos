import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { harvestPlans, harvestLots, weighbridgeTickets } from '../../database/schema/harvest.js';
import type { Principal } from '../../iam/auth.service.js';

export const CreateHarvestPlanSchema = z.object({
  seasonYear: z.number().int().min(2000).max(2200),
  plotId: z.string().uuid(),
  expectedStartDate: z.string().date().optional(),
  expectedEndDate: z.string().date().optional(),
  expectedYieldKg: z.number().positive().optional(),
  expectedYieldKgHa: z.number().positive().optional(),
  forecastMethod: z.string().max(60).optional(),
  forecastMetadata: z.record(z.unknown()).default({}),
});
export type CreateHarvestPlanDto = z.infer<typeof CreateHarvestPlanSchema>;

export const RecordHarvestLotSchema = z.object({
  planId: z.string().uuid().optional(),
  plotId: z.string().uuid(),
  lotCode: z.string().min(1).max(40),
  harvestedOn: z.string().date(),
  varietyId: z.string().uuid().optional(),
  crewId: z.string().uuid().optional(),
  grossKg: z.number().nonnegative(),
  tareKg: z.number().nonnegative().default(0),
  containersCount: z.number().int().nonnegative().optional(),
  qualityGrade: z.string().max(20).optional(),
  geom: z.object({ lat: z.number(), lng: z.number() }).optional(),
  notes: z.string().max(2000).optional(),
});
export type RecordHarvestLotDto = z.infer<typeof RecordHarvestLotSchema>;

export const RecordTicketSchema = z.object({
  lotId: z.string().uuid(),
  ticketNumber: z.string().min(1).max(60),
  scaleId: z.string().max(40).optional(),
  weighedAt: z.string().datetime(),
  vehiclePlate: z.string().max(20).optional(),
  driver: z.string().max(120).optional(),
  grossKg: z.number().nonnegative(),
  tareKg: z.number().nonnegative(),
});
export type RecordTicketDto = z.infer<typeof RecordTicketSchema>;

@Injectable()
export class HarvestService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  listPlans(principal: Principal, seasonYear?: number) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(harvestPlans)
        .where(seasonYear ? eq(harvestPlans.seasonYear, seasonYear) : undefined)
        .orderBy(desc(harvestPlans.createdAt));
    });
  }

  createPlan(principal: Principal, dto: CreateHarvestPlanDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .insert(harvestPlans)
        .values({
          orgId: principal.orgId,
          seasonYear: dto.seasonYear,
          plotId: dto.plotId,
          expectedStartDate: dto.expectedStartDate,
          expectedEndDate: dto.expectedEndDate,
          expectedYieldKg: dto.expectedYieldKg?.toString(),
          expectedYieldKgHa: dto.expectedYieldKgHa?.toString(),
          forecastMethod: dto.forecastMethod,
          forecastMetadata: dto.forecastMetadata,
          status: 'draft',
        })
        .returning();
      return row;
    });
  }

  recordLot(principal: Principal, dto: RecordHarvestLotDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .insert(harvestLots)
        .values({
          orgId: principal.orgId,
          planId: dto.planId,
          plotId: dto.plotId,
          lotCode: dto.lotCode,
          harvestedOn: dto.harvestedOn,
          harvestedAt: new Date(),
          varietyId: dto.varietyId,
          crewId: dto.crewId,
          grossKg: dto.grossKg.toString(),
          tareKg: dto.tareKg.toString(),
          containersCount: dto.containersCount,
          qualityGrade: dto.qualityGrade,
          geom: dto.geom ? `SRID=4326;POINT(${dto.geom.lng} ${dto.geom.lat})` : null,
          notes: dto.notes,
          recordedBy: principal.userId,
          status: 'open',
        })
        .returning();

      await tx.execute(sql`
        INSERT INTO audit.audit_events
          (org_id, aggregate_type, aggregate_id, seq, event_type, payload, actor_id, occurred_at)
        VALUES
          (${principal.orgId}, 'harvest_lot', ${row.id}, 1, 'HarvestLotOpened',
           ${JSON.stringify({ lotCode: dto.lotCode, grossKg: dto.grossKg })}::jsonb,
           ${principal.userId}, now())
      `);
      return row;
    });
  }

  recordTicket(principal: Principal, dto: RecordTicketDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [lot] = await tx.select().from(harvestLots).where(eq(harvestLots.id, dto.lotId));
      if (!lot) throw new NotFoundException('lot_not_found');

      const [ticket] = await tx
        .insert(weighbridgeTickets)
        .values({
          orgId: principal.orgId,
          lotId: dto.lotId,
          ticketNumber: dto.ticketNumber,
          scaleId: dto.scaleId,
          weighedAt: new Date(dto.weighedAt),
          vehiclePlate: dto.vehiclePlate,
          driver: dto.driver,
          grossKg: dto.grossKg.toString(),
          tareKg: dto.tareKg.toString(),
          recordedBy: principal.userId,
        })
        .returning();

      await tx
        .update(harvestLots)
        .set({
          grossKg: sql`${harvestLots.grossKg} + ${dto.grossKg}`,
          tareKg: sql`${harvestLots.tareKg} + ${dto.tareKg}`,
        })
        .where(eq(harvestLots.id, dto.lotId));

      await tx.execute(sql`
        INSERT INTO audit.audit_events
          (org_id, aggregate_type, aggregate_id, seq, event_type, payload, actor_id, occurred_at)
        VALUES
          (${principal.orgId}, 'harvest_lot', ${dto.lotId},
           (SELECT COALESCE(MAX(seq),0)+1 FROM audit.audit_events WHERE aggregate_type='harvest_lot' AND aggregate_id=${dto.lotId}),
           'WeighbridgeTicketRecorded',
           ${JSON.stringify({ ticketNumber: dto.ticketNumber, grossKg: dto.grossKg, tareKg: dto.tareKg })}::jsonb,
           ${principal.userId}, ${dto.weighedAt})
      `);
      return ticket;
    });
  }

  listLots(principal: Principal, plotId?: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(harvestLots)
        .where(plotId ? eq(harvestLots.plotId, plotId) : undefined)
        .orderBy(desc(harvestLots.harvestedOn))
        .limit(200);
    });
  }
}
