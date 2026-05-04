import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { phenologyEvents, phenologyProfiles, gddDaily } from '../../database/schema/phenology.js';
import type { Principal } from '../../iam/auth.service.js';

export const RecordPhenologyEventSchema = z.object({
  plotId: z.string().uuid(),
  observedAt: z.string().datetime(),
  bbchCode: z.string().regex(/^\d{2}$/),
  observedPct: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.unknown()).default([]),
});
export type RecordPhenologyEventDto = z.infer<typeof RecordPhenologyEventSchema>;

export const GddQuerySchema = z.object({
  plotId: z.string().uuid(),
  from: z.string().date(),
  to: z.string().date(),
  baseTempC: z.coerce.number().min(0).max(20).default(10),
  upperTempC: z.coerce.number().min(0).max(40).optional(),
});
export type GddQuery = z.infer<typeof GddQuerySchema>;

@Injectable()
export class PhenologyService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  listEvents(principal: Principal, plotId: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(phenologyEvents)
        .where(eq(phenologyEvents.plotId, plotId))
        .orderBy(desc(phenologyEvents.observedAt));
    });
  }

  recordEvent(principal: Principal, dto: RecordPhenologyEventDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .insert(phenologyEvents)
        .values({
          orgId: principal.orgId,
          plotId: dto.plotId,
          observedAt: new Date(dto.observedAt),
          bbchCode: dto.bbchCode,
          observedPct: dto.observedPct?.toString(),
          observerId: principal.userId,
          notes: dto.notes,
          attachments: dto.attachments,
        })
        .returning();
      return row;
    });
  }

  // Compute GDD using single-triangle method (Zalom et al. 1983).
  computeGdd(principal: Principal, query: GddQuery) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const rows = await tx.execute<{
        observed_on: string;
        tmin_c: string | null;
        tmax_c: string | null;
        gdd: string;
        cumulative_gdd: string | null;
      }>(sql`
        WITH base AS (
          SELECT
            observed_on,
            tmin_c,
            tmax_c,
            karpos.gdd_single_triangle(tmin_c, tmax_c, ${query.baseTempC}::numeric, ${query.upperTempC ?? null}) AS gdd
          FROM karpos.gdd_daily
          WHERE plot_id = ${query.plotId}
            AND observed_on BETWEEN ${query.from}::date AND ${query.to}::date
        )
        SELECT
          observed_on::text,
          tmin_c::text,
          tmax_c::text,
          gdd::text,
          (sum(gdd) OVER (ORDER BY observed_on))::text AS cumulative_gdd
        FROM base
        ORDER BY observed_on ASC
      `);
      return rows;
    });
  }

  listProfiles(principal: Principal, speciesId?: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(phenologyProfiles)
        .where(speciesId ? eq(phenologyProfiles.speciesId, speciesId) : undefined);
    });
  }
}
