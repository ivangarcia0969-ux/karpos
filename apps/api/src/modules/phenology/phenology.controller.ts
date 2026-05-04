import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import {
  GddQuery,
  GddQuerySchema,
  PhenologyService,
  RecordPhenologyEventDto,
  RecordPhenologyEventSchema,
} from './phenology.service.js';

@ApiTags('fenoflow')
@ApiBearerAuth()
@Controller('phenology')
export class PhenologyController {
  constructor(private readonly service: PhenologyService) {}

  @Get('events')
  @Permissions('phenology:read')
  listEvents(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId: string) {
    return this.service.listEvents(principal, plotId);
  }

  @Post('events')
  @Permissions('phenology:write')
  recordEvent(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordPhenologyEventSchema)) dto: RecordPhenologyEventDto,
  ) {
    return this.service.recordEvent(principal, dto);
  }

  @Get('gdd')
  @Permissions('phenology:read')
  gdd(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(GddQuerySchema)) query: GddQuery,
  ) {
    return this.service.computeGdd(principal, query);
  }

  @Get('profiles')
  @Permissions('phenology:read')
  listProfiles(@CurrentPrincipal() principal: Principal, @Query('speciesId') speciesId?: string) {
    return this.service.listProfiles(principal, speciesId);
  }
}
