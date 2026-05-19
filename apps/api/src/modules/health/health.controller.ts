import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { HealthService, RecordScoutingSchema, RecordSpraySchema } from './health.service.js';
import type { RecordScoutingDto, RecordSprayDto } from './health.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

const ScoutingsQuery = z.object({ plotId: z.string().uuid() });
const VoidSpraySchema = z.object({ reason: z.string().min(3).max(500) });

@Controller('/v1/health')
export class HealthSanidadController {
  constructor(private readonly svc: HealthService) {}

  @Get('scoutings')
  listScoutings(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ScoutingsQuery)) q: z.infer<typeof ScoutingsQuery>,
  ) {
    return this.svc.listScoutings(principal, q.plotId);
  }

  @Post('scoutings')
  recordScouting(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordScoutingSchema)) body: RecordScoutingDto,
  ) {
    return this.svc.recordScouting(principal, body);
  }

  @Get('sprays')
  listSprays(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId?: string) {
    return this.svc.listSprays(principal, plotId);
  }

  @Post('sprays')
  recordSpray(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordSpraySchema)) body: RecordSprayDto,
  ) {
    return this.svc.recordSpray(principal, body);
  }

  @Post('sprays/:id/void')
  voidSpray(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(VoidSpraySchema)) body: z.infer<typeof VoidSpraySchema>,
  ) {
    return this.svc.voidSpray(principal, id, body.reason);
  }
}
