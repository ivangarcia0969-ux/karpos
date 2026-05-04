import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../database/database.module.js';

@Injectable()
export class TenancyService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async withTenant<T>(orgId: string, actorId: string | null, fn: (tx: Database) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => {
      await tx.execute(sql`SET LOCAL app.current_org = ${orgId}`);
      if (actorId) {
        await tx.execute(sql`SET LOCAL app.current_actor = ${actorId}`);
      }
      return fn(tx as unknown as Database);
    });
  }
}
