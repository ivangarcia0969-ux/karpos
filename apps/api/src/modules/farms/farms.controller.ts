import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import {
  CreateFarmSchema,
  FarmsService,
  ListFarmsQuerySchema,
  UpdateFarmSchema,
} from './farms.service.js';
import type { CreateFarmDto, ListFarmsQuery, UpdateFarmDto } from './farms.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@Controller('/v1/farms')
export class FarmsController {
  constructor(private readonly svc: FarmsService) {}

  @Get()
  list(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ListFarmsQuerySchema)) query: ListFarmsQuery,
  ) {
    return this.svc.list(principal, query);
  }

  @Get(':id')
  get(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.get(principal, id);
  }

  @Post()
  create(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(CreateFarmSchema)) body: CreateFarmDto,
  ) {
    return this.svc.create(principal, body);
  }

  @Put(':id')
  update(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateFarmSchema)) body: UpdateFarmDto,
  ) {
    return this.svc.update(principal, id, body);
  }

  @Delete(':id')
  remove(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(principal, id);
  }
}
