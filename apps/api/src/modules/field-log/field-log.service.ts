import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { fieldOperations, workerOutputs } from '../../database/schema/field-ops.js';
import type { Principal } from '../../iam/auth.service.js';

export const LogOperationSchema = z.object({
  plotId: z.string().uuid(),
  operationTypeId: z.string().uuid(),
  performedAt: z.string().datetime(),
  finishedAt: z.string().datetime().optional(),
  crewId: z.string().uuid().optional(),
  workersCount: z.number().int().positive().optional(),
  areaCoveredHa: z.number().positive().optional(),
  outputQuantity: z.number().nonnegative().optional(),
  outputUnit: z.string().max(20).optional(),
  costAmount: z.number().nonnegative().optional(),
  costCurrency: z.string().length(3).optional(),
  geom: z.object({ lat: z.number(), lng: z.number() }).optional(),
  notes: z.string().max(2000).optional(),
  attachments: z.array(z.unknown()).default([]),
  metadata: z.record(z.unknown()).default({}),
  workerOutputs: z
    .array(
      z.object({
        workerId: z.string().uuid(),
        hours: z.number().nonnegative().optional(),
        units: z.number().nonnegative().optional(),
        unit: z.string().max(20).optional(),
        amountPaid: z.number().nonnegative().optional(),
        currency: z.string().length(3).optional(),
      }),
    )
    .default([]),
});
export type LogOperationDto = z.infer<typeof LogOperationSchema>;

export const ListOperationsQuerySchema = z.object({
  plotId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type ListOperationsQuery = z.infer<typeof ListOperationsQuerySchema>;

@Injectable()
export class FieldLogService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  list(principal: Principal, query: ListOperationsQuery) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const conditions = [];
      if (query.plotId) conditions.push(eq(fieldOperations.plotId, query.plotId));
      if (query.from) conditions.push(gte(fieldOperations.performedAt, new Date(query.from)));
      if (query.to) conditions.push(lte(fieldOperations.performedAt, new Date(query.to)));

      const where = conditions.length ? and(...conditions) : undefined;
      const offset = (query.page - 1) * query.pageSize;

      return tx
        .select()
        .from(fieldOperations)
        .where(where)
        .orderBy(desc(fieldOperations.performedAt))
        .limit(query.pageSize)
        .offset(offset);
    });
  }

  log(principal: Principal, dto: LogOperationDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      const [op] = await tx
        .insert(fieldOperations)
        .values({
          orgId: principal.orgId,
          plotId: dto.plotId,
          operationTypeId: dto.operationTypeId,
          performedAt: new Date(dto.performedAt),
          finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : null,
          crewId: dto.crewId,
          workersCount: dto.workersCount,
          areaCoveredHa: dto.areaCoveredHa?.toString(),
          outputQuantity: dto.outputQuantity?.toString(),
          outputUnit: dto.outputUnit,
          costAmount: dto.costAmount?.toString(),
          costCurrency: dto.costCurrency,
          geom: dto.geom ? `SRID=4326;POINT(${dto.geom.lng} ${dto.geom.lat})` : null,
          notes: dto.notes,
          attachments: dto.attachments,
          metadata: dto.metadata,
          recordedBy: principal.userId,
        })
        .returning();

      if (dto.workerOutputs.length) {
        await tx.insert(workerOutputs).values(
          dto.workerOutputs.map((w) => ({
            orgId: principal.orgId,
            fieldOperationId: op.id,
            workerId: w.workerId,
            hours: w.hours?.toString(),
            units: w.units?.toString(),
            unit: w.unit,
            amountPaid: w.amountPaid?.toString(),
            currency: w.currency,
          })),
        );
      }

      return op;
    });
  }
}
