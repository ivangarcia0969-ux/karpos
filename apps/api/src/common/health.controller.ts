import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import { Public } from '../iam/decorators/public.decorator.js';
import { DRIZZLE, type Database } from '../database/database.module.js';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'karpos-api', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('ready')
  async ready() {
    try {
      await this.db.execute(sql`select 1`);
      return { status: 'ready' };
    } catch (err) {
      return { status: 'degraded', reason: (err as Error).message };
    }
  }
}
