import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { phenologyEvents } from '../../database/schema/phenology.js';
import type { Principal } from '../../iam/auth.service.js';

export const RecordEventSchema = z.object({
  plotId: z.string().uuid(),
  observedOn: z.string().date(),
  bbchCode: z.string().min(1).max(6),
  stageLabel: z.string().max(120).optional(),
  pctInStage: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).optional(),
  metadata: z.record(z.unknown()).default({}),
});
export type RecordEventDto = z.infer<typeof RecordEventSchema>;

@Injectable()
export class PhenologyService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  list(principal: Principal, plotId: string) {
    return this.db
      .select()
      .from(phenologyEvents)
      .where(and(eq(phenologyEvents.orgId, principal.orgId), eq(phenologyEvents.plotId, plotId)))
      .orderBy(desc(phenologyEvents.observedOn))
      .limit(500);
  }

  async record(principal: Principal, dto: RecordEventDto) {
    const [row] = await this.db
      .insert(phenologyEvents)
      .values({
        orgId: principal.orgId,
        plotId: dto.plotId,
        observedOn: dto.observedOn,
        bbchCode: dto.bbchCode,
        stageLabel: dto.stageLabel,
        pctInStage: dto.pctInStage?.toString(),
        notes: dto.notes,
        metadata: dto.metadata,
        recordedBy: principal.userId,
      })
      .returning();
    return row;
  }

  async remove(principal: Principal, id: string) {
    const [row] = await this.db
      .delete(phenologyEvents)
      .where(and(eq(phenologyEvents.orgId, principal.orgId), eq(phenologyEvents.id, id)))
      .returning({ id: phenologyEvents.id });
    if (!row) throw new NotFoundException('event_not_found');
    return { ok: true };
  }
}
