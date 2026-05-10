import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { FarmsService } from './farms.service.js';
import { CreateFarmSchema, ListFarmsQuerySchema, UpdateFarmSchema } from './farms.dto.js';
import type { CreateFarmDto, ListFarmsQuery, UpdateFarmDto } from './farms.dto.js';

@ApiTags('predios')
@ApiBearerAuth()
@Controller('farms')
export class FarmsController {
  constructor(private readonly service: FarmsService) {}

  @Get()
  @Permissions('farms:read')
  list(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ListFarmsQuerySchema)) query: ListFarmsQuery,
  ) {
    return this.service.list(principal, query);
  }

  @Get(':id')
  @Permissions('farms:read')
  byId(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.service.byId(principal, id);
  }

  @Get(':id/stats')
  @Permissions('farms:read')
  stats(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.service.statsByFarm(principal, id);
  }

  @Post()
  @Permissions('farms:write')
  create(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateFarmSchema)) dto: CreateFarmDto,
  ) {
    return this.service.create(principal, dto);
  }

  @Patch(':id')
  @Permissions('farms:write')
  update(
    @CurrentPrincipal() principal: Principal,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateFarmSchema)) dto: UpdateFarmDto,
  ) {
    return this.service.update(principal, id, dto);
  }

  @Delete(':id')
  @Permissions('farms:write')
  remove(@CurrentPrincipal() principal: Principal, @Param('id') id: string) {
    return this.service.remove(principal, id);
  }
}
