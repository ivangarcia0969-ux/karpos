import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { PlotsService, CreatePlotDto, CreatePlotSchema } from './plots.service.js';

@ApiTags('predios')
@ApiBearerAuth()
@Controller('plots')
export class PlotsController {
  constructor(private readonly service: PlotsService) {}

  @Get()
  @Permissions('farms:read')
  list(@CurrentPrincipal() principal: Principal, @Query('farmId') farmId?: string) {
    return this.service.list(principal, farmId);
  }

  @Get(':id')
  @Permissions('farms:read')
  byId(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.service.byId(principal, id);
  }

  @Post()
  @Permissions('farms:write')
  create(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreatePlotSchema)) dto: CreatePlotDto,
  ) {
    return this.service.create(principal, dto);
  }
}
