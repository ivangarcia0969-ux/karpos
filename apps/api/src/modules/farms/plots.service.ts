import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { plots } from '../../database/schema/farms.js';
import type { Principal } from '../../iam/auth.service.js';
import { z } from 'zod';

export const CreatePlotSchema = z.object({
  farmId: z.string().uuid(),
  sectorId: z.string().uuid().optional(),
  code: z.string().min(1).max(40),
  name: z.string().min(1).max(120),
  speciesId: z.string().uuid(),
  varietyId: z.string().uuid().optional(),
  rootstockId: z.string().uuid().optional(),
  trainingSystemId: z.string().uuid().optional(),
  plantingDate: z.string().date().optional(),
  spacingRowM: z.number().positive().optional(),
  spacingTreeM: z.number().positive().optional(),
  treesCount: z.number().int().nonnegative().optional(),
  areaHa: z.number().positive().optional(),
  status: z.enum(['planning', 'establishing', 'active', 'retired']).default('active'),
  metadata: z.record(z.unknown()).default({}),
});
export type CreatePlotDto = z.infer<typeof CreatePlotSchema>;

@Injectable()
export class PlotsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  list(principal: Principal, farmId?: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(plots)
        .where(farmId ? eq(plots.farmId, farmId) : undefined);
    });
  }

  byId(principal: Principal, id: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx.select().from(plots).where(eq(plots.id, id));
      if (!row) throw new NotFoundException('plot_not_found');
      return row;
    });
  }

  create(principal: Principal, dto: CreatePlotDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .insert(plots)
        .values({
          orgId: principal.orgId,
          farmId: dto.farmId,
          sectorId: dto.sectorId,
          code: dto.code,
          name: dto.name,
          speciesId: dto.speciesId,
          varietyId: dto.varietyId,
          rootstockId: dto.rootstockId,
          trainingSystemId: dto.trainingSystemId,
          plantingDate: dto.plantingDate,
          spacingRowM: dto.spacingRowM?.toString(),
          spacingTreeM: dto.spacingTreeM?.toString(),
          treesCount: dto.treesCount,
          areaHa: dto.areaHa?.toString(),
          status: dto.status,
          metadata: dto.metadata,
        })
        .returning();
      return row;
    });
  }
}
