import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { farms, sectors, plots } from '../../database/schema/farms.js';
import type { CreateFarmDto, ListFarmsQuery, UpdateFarmDto } from './farms.dto.js';
import type { Principal } from '../../iam/auth.service.js';

@Injectable()
export class FarmsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  async list(principal: Principal, query: ListFarmsQuery) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const offset = (query.page - 1) * query.pageSize;
      const where = query.q
        ? or(ilike(farms.name, `%${query.q}%`), ilike(farms.code, `%${query.q}%`))
        : undefined;

      const rows = await tx
        .select()
        .from(farms)
        .where(where)
        .limit(query.pageSize)
        .offset(offset);

      const [{ count }] = await tx.execute<{ count: string }>(
        sql`select count(*)::text as count from karpos.farms ${where ? sql`where ${where}` : sql``}`,
      );

      return { rows, total: Number(count), page: query.page, pageSize: query.pageSize };
    });
  }

  async byId(principal: Principal, id: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx.select().from(farms).where(eq(farms.id, id));
      if (!row) throw new NotFoundException('farm_not_found');
      return row;
    });
  }

  async create(principal: Principal, dto: CreateFarmDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const centroidWkt = dto.centroid ? `SRID=4326;POINT(${dto.centroid.lng} ${dto.centroid.lat})` : null;

      const [row] = await tx
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
          centroid: centroidWkt as unknown as string,
          contact: dto.contact,
          metadata: dto.metadata,
        })
        .returning();

      return row;
    });
  }

  async update(principal: Principal, id: string, dto: UpdateFarmDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [row] = await tx
        .update(farms)
        .set({
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.region !== undefined && { region: dto.region }),
          ...(dto.locality !== undefined && { locality: dto.locality }),
          ...(dto.elevationM !== undefined && { elevationM: dto.elevationM }),
          ...(dto.totalAreaHa !== undefined && { totalAreaHa: dto.totalAreaHa.toString() }),
          ...(dto.contact !== undefined && { contact: dto.contact }),
          ...(dto.metadata !== undefined && { metadata: dto.metadata }),
          updatedAt: new Date(),
        })
        .where(eq(farms.id, id))
        .returning();
      if (!row) throw new NotFoundException('farm_not_found');
      return row;
    });
  }

  async remove(principal: Principal, id: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const result = await tx.delete(farms).where(eq(farms.id, id));
      if (result.length === 0) throw new NotFoundException('farm_not_found');
      return { ok: true };
    });
  }

  async statsByFarm(principal: Principal, farmId: string) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const rows = await tx.execute<{ plots_count: number; trees_count: number; total_area_ha: string }>(
        sql`
          select
            count(distinct p.id)::int as plots_count,
            coalesce(sum(p.trees_count), 0)::int as trees_count,
            coalesce(sum(p.area_ha), 0)::text as total_area_ha
          from karpos.plots p
          where p.farm_id = ${farmId}
        `,
      );
      return rows[0] ?? { plots_count: 0, trees_count: 0, total_area_ha: '0' };
    });
  }
}
