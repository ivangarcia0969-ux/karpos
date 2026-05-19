import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  CreateHarvestPlanSchema,
  HarvestService,
  RecordHarvestLotSchema,
} from './harvest.service.js';
import type { CreateHarvestPlanDto, RecordHarvestLotDto } from './harvest.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@Controller('/v1/harvest')
export class HarvestController {
  constructor(private readonly svc: HarvestService) {}

  @Get('plans')
  listPlans(
    @CurrentPrincipal() principal: Principal,
    @Query('seasonYear') seasonYear?: string,
  ) {
    return this.svc.listPlans(principal, seasonYear ? Number(seasonYear) : undefined);
  }

  @Post('plans')
  createPlan(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateHarvestPlanSchema)) body: CreateHarvestPlanDto,
  ) {
    return this.svc.createPlan(principal, body);
  }

  @Get('lots')
  listLots(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId?: string) {
    return this.svc.listLots(principal, plotId);
  }

  @Post('lots')
  recordLot(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordHarvestLotSchema)) body: RecordHarvestLotDto,
  ) {
    return this.svc.recordLot(principal, body);
  }

  @Delete('lots/:id')
  voidLot(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.voidLot(principal, id);
  }
}
