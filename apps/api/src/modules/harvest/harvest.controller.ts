import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import {
  CreateHarvestPlanDto,
  CreateHarvestPlanSchema,
  HarvestService,
  RecordHarvestLotDto,
  RecordHarvestLotSchema,
  RecordTicketDto,
  RecordTicketSchema,
} from './harvest.service.js';

@ApiTags('cosecha360')
@ApiBearerAuth()
@Controller('harvest')
export class HarvestController {
  constructor(private readonly service: HarvestService) {}

  @Get('plans')
  @Permissions('harvest:read')
  listPlans(@CurrentPrincipal() principal: Principal, @Query('seasonYear') seasonYear?: number) {
    return this.service.listPlans(principal, seasonYear ? Number(seasonYear) : undefined);
  }

  @Post('plans')
  @Permissions('harvest:plan')
  createPlan(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateHarvestPlanSchema)) dto: CreateHarvestPlanDto,
  ) {
    return this.service.createPlan(principal, dto);
  }

  @Get('lots')
  @Permissions('harvest:read')
  listLots(@CurrentPrincipal() principal: Principal, @Query('plotId') plotId?: string) {
    return this.service.listLots(principal, plotId);
  }

  @Post('lots')
  @Permissions('harvest:write')
  recordLot(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordHarvestLotSchema)) dto: RecordHarvestLotDto,
  ) {
    return this.service.recordLot(principal, dto);
  }

  @Post('tickets')
  @Permissions('harvest:write')
  recordTicket(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordTicketSchema)) dto: RecordTicketDto,
  ) {
    return this.service.recordTicket(principal, dto);
  }
}
