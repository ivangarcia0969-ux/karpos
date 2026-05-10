import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { HealthService, RecordScoutingSchema, RecordSpraySchema } from './health.service.js';
import type { RecordScoutingDto, RecordSprayDto } from './health.service.js';

@ApiTags('sanidad-plus')
@ApiBearerAuth()
@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get('scoutings')
  @Permissions('health:read')
  listScoutings(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId: string) {
    return this.service.listScoutings(principal, plotId);
  }

  @Post('scoutings')
  @Permissions('health:write')
  recordScouting(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordScoutingSchema)) dto: RecordScoutingDto,
  ) {
    return this.service.recordScouting(principal, dto);
  }

  @Get('sprays')
  @Permissions('health:read')
  listSprays(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId?: string) {
    return this.service.listSprays(principal, plotId);
  }

  @Post('sprays')
  @Permissions('sprays:apply')
  recordSpray(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordSpraySchema)) dto: RecordSprayDto,
  ) {
    return this.service.recordSpray(principal, dto);
  }

  @Post('sprays/:id/void')
  @Permissions('sprays:apply')
  voidSpray(
    @CurrentPrincipal() principal: Principal,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.service.voidSpray(principal, id, reason);
  }
}
