import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { pestScoutings, sprayRecords, sprayRecordItems } from '../../database/schema/health.js';
import type { Principal } from '../../iam/auth.service.js';

export const RecordScoutingSchema = z.object({
  plotId: z.string().uuid(),
  observedAt: z.string().datetime(),
  pestTaxonId: z.string().uuid(),
  severityScale: z.string().min(1),
  severityValue: z.number().min(0).optional(),
  incidencePct: z.number().min(0).max(100).optional(),
  sampleSize: z.number().int().positive().optional(),
  geom: z.object({ lat: z.number(), lng: z.number() }).optional(),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.unknown()).default([]),
  source: z.enum(['manual', 'vision', 'trap']).default('manual'),
});
export type RecordScoutingDto = z.infer<typeof RecordScoutingSchema>;

export const RecordSpraySchema = z.object({
  plotId: z.string().uuid(),
  appliedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
  applicatorName: z.string().max(120).optional(),
  applicatorLicense: z.string().max(40).optional(),
  equipment: z.string().max(120).optional(),
  areaTreatedHa: z.number().positive(),
  waterLHa: z.number().positive().optional(),
  weather: z
    .object({
      tempC: z.number().optional(),
      rhPct: z.number().optional(),
      windMs: z.number().optional(),
    })
    .optional(),
  phBefore: z.number().min(0).max(14).optional(),
  notes: z.string().max(2000).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        targetTaxonId: z.string().uuid().optional(),
        doseValue: z.number().positive(),
        doseUnit: z.string().min(1),
      }),
    )
    .min(1),
});
export type RecordSprayDto = z.infer<typeof RecordSpraySchema>;

@Injectable()
export class HealthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  listScoutings(principal: Principal, plotId: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(pestScoutings)
        .where(eq(pestScoutings.plotId, plotId))
        .orderBy(desc(pestScoutings.observedAt));
    });
  }

  recordScouting(principal: Principal, dto: RecordScoutingDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .insert(pestScoutings)
        .values({
          orgId: principal.orgId,
          plotId: dto.plotId,
          observedAt: new Date(dto.observedAt),
          observerId: principal.userId,
          pestTaxonId: dto.pestTaxonId,
          severityScale: dto.severityScale,
          severityValue: dto.severityValue?.toString(),
          incidencePct: dto.incidencePct?.toString(),
          sampleSize: dto.sampleSize,
          geom: dto.geom ? `SRID=4326;POINT(${dto.geom.lng} ${dto.geom.lat})` : null,
          notes: dto.notes,
          attachments: dto.attachments,
          source: dto.source,
        })
        .returning();
      return row;
    });
  }

  listSprays(principal: Principal, plotId?: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(sprayRecords)
        .where(plotId ? eq(sprayRecords.plotId, plotId) : undefined)
        .orderBy(desc(sprayRecords.appliedAt))
        .limit(200);
    });
  }

  // Records a spray, automatically computes max PHI/REI from product catalog.
  recordSpray(principal: Principal, dto: RecordSprayDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const productIds = dto.items.map((i) => i.productId);
      const phiRei = await tx.execute<{ max_phi: number | null; max_rei: number | null }>(sql`
        SELECT
          MAX(default_phi_days) AS max_phi,
          MAX(default_rei_hours) AS max_rei
        FROM catalog.chemical_products
        WHERE id = ANY(${productIds}::uuid[])
      `);
      const { max_phi, max_rei } = phiRei[0] ?? { max_phi: null, max_rei: null };
      const appliedAt = new Date(dto.appliedAt);
      const phiUntil = max_phi
        ? new Date(appliedAt.getTime() + Number(max_phi) * 86_400_000).toISOString().slice(0, 10)
        : null;
      const reiUntil = max_rei ? new Date(appliedAt.getTime() + Number(max_rei) * 3_600_000) : null;

      const [spray] = await tx
        .insert(sprayRecords)
        .values({
          orgId: principal.orgId,
          plotId: dto.plotId,
          appliedAt,
          finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : null,
          applicatorId: principal.userId,
          applicatorName: dto.applicatorName,
          applicatorLicense: dto.applicatorLicense,
          equipment: dto.equipment,
          areaTreatedHa: dto.areaTreatedHa.toString(),
          waterLHa: dto.waterLHa?.toString(),
          weatherTempC: dto.weather?.tempC?.toString(),
          weatherRhPct: dto.weather?.rhPct?.toString(),
          weatherWindMs: dto.weather?.windMs?.toString(),
          phBefore: dto.phBefore?.toString(),
          notes: dto.notes,
          phiUntil,
          reiUntil,
          status: 'applied',
          recordedBy: principal.userId,
        })
        .returning();

      await tx.insert(sprayRecordItems).values(
        dto.items.map((i) => ({
          sprayRecordId: spray.id,
          productId: i.productId,
          targetTaxonId: i.targetTaxonId,
          doseValue: i.doseValue.toString(),
          doseUnit: i.doseUnit,
        })),
      );

      // Append immutable audit event.
      await tx.execute(sql`
        INSERT INTO audit.audit_events
          (org_id, aggregate_type, aggregate_id, seq, event_type, payload, actor_id, actor_role, occurred_at)
        VALUES
          (${principal.orgId}, 'spray_record', ${spray.id}, 1, 'SprayApplied',
           ${JSON.stringify({ items: dto.items, areaTreatedHa: dto.areaTreatedHa, phiUntil, reiUntil })}::jsonb,
           ${principal.userId}, ${principal.roles[0] ?? 'unknown'}, ${appliedAt.toISOString()})
      `);

      return spray;
    });
  }

  voidSpray(principal: Principal, id: string, reason: string) {
    if (!reason || reason.length < 5) throw new BadRequestException('reason_required');
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [spray] = await tx
        .update(sprayRecords)
        .set({ status: 'voided', voidedReason: reason })
        .where(eq(sprayRecords.id, id))
        .returning();

      await tx.execute(sql`
        INSERT INTO audit.audit_events
          (org_id, aggregate_type, aggregate_id, seq, event_type, payload, actor_id, occurred_at)
        VALUES
          (${principal.orgId}, 'spray_record', ${id},
           (SELECT COALESCE(MAX(seq),0)+1 FROM audit.audit_events WHERE aggregate_type='spray_record' AND aggregate_id=${id}),
           'SprayVoided', ${JSON.stringify({ reason })}::jsonb, ${principal.userId}, now())
      `);
      return spray;
    });
  }
}
