import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { fieldOperations } from '../../database/schema/field-ops.js';
import type { Principal } from '../../iam/auth.service.js';

export const LogOperationSchema = z.object({
  plotId: z.string().uuid(),
  operationType: z.enum([
    'prune',
    'fertilize',
    'spray',
    'irrigate',
    'thin',
    'mow',
    'manual_log',
    'training',
    'soil_amendment',
    'pest_monitoring',
    'other',
  ]),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  areaHa: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
  inputs: z.array(z.record(z.unknown())).default([]),
  metadata: z.record(z.unknown()).default({}),
});
export type LogOperationDto = z.infer<typeof LogOperationSchema>;

export const ListOperationsQuerySchema = z.object({
  plotId: z.string().uuid().optional(),
  operationType: z.string().optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});
export type ListOperationsQuery = z.infer<typeof ListOperationsQuerySchema>;

@Injectable()
export class FieldLogService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list(principal: Principal, query: ListOperationsQuery) {
    const conditions = [eq(fieldOperations.orgId, principal.orgId)];
    if (query.plotId) conditions.push(eq(fieldOperations.plotId, query.plotId));
    if (query.operationType) conditions.push(eq(fieldOperations.operationType, query.operationType));
    if (query.from) conditions.push(gte(fieldOperations.startedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(fieldOperations.startedAt, new Date(query.to)));
    const offset = (query.page - 1) * query.pageSize;
    return this.db
      .select()
      .from(fieldOperations)
      .where(and(...conditions))
      .orderBy(desc(fieldOperations.startedAt))
      .limit(query.pageSize)
      .offset(offset);
  }

  async get(principal: Principal, id: string) {
    const [row] = await this.db
      .select()
      .from(fieldOperations)
      .where(and(eq(fieldOperations.orgId, principal.orgId), eq(fieldOperations.id, id)));
    if (!row) throw new NotFoundException('operation_not_found');
    return row;
  }

  async log(principal: Principal, dto: LogOperationDto) {
    const [row] = await this.db
      .insert(fieldOperations)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        operationType: dto.operationType,
        startedAt: new Date(dto.startedAt),
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
        areaHa: dto.areaHa?.toString(),
        notes: dto.notes,
        inputs: dto.inputs,
        metadata: dto.metadata,
        recordedBy: principal.userId,
      })
      .returning();
    return row;
  }
}
