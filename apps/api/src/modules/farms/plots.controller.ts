import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CreatePlotSchema, PlotsService, UpdatePlotSchema } from './plots.service.js';
import type { CreatePlotDto, UpdatePlotDto } from './plots.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@Controller('/v1/plots')
export class PlotsController {
  constructor(private readonly svc: PlotsService) {}

  @Get()
  list(@CurrentPrincipal() principal: Principal, @Query('farmId') farmId?: string) {
    return this.svc.list(principal, farmId);
  }

  @Get(':id')
  get(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.get(principal, id);
  }

  @Post()
  create(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreatePlotSchema)) body: CreatePlotDto,
  ) {
    return this.svc.create(principal, body);
  }

  @Put(':id')
  update(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdatePlotSchema)) body: UpdatePlotDto,
  ) {
    return this.svc.update(principal, id, body);
  }

  @Delete(':id')
  remove(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(principal, id);
  }
}
