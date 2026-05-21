import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import {
  CatalogService,
  FitoProductCreateSchema,
  FitoProductUpdateSchema,
} from './catalog.service.js';
import type { FitoProductCreateDto, FitoProductUpdateDto } from './catalog.service.js';
import { Public } from '../../iam/decorators/public.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@Controller('/v1/catalog')
export class CatalogController {
  constructor(private readonly svc: CatalogService) {}

  @Public()
  @Get('species')
  listSpecies() {
    return this.svc.listSpecies();
  }

  @Public()
  @Get('varieties')
  listVarieties(@Query('speciesId') speciesId?: string) {
    return this.svc.listVarieties(speciesId);
  }

  @Get('fito-products')
  listFitoProducts(
    @CurrentPrincipal() principal: Principal,
    @Query('category') category?: string,
    @Query('q') q?: string,
    @Query('cropCode') cropCode?: string,
  ) {
    return this.svc.listFitoProducts({ orgId: principal.orgId, category, q, cropCode });
  }

  @Get('fito-products/:id')
  getFitoProduct(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.getFitoProduct(principal.orgId, id);
  }

  @Post('fito-products')
  createFitoProduct(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(FitoProductCreateSchema)) body: FitoProductCreateDto,
  ) {
    return this.svc.createFitoProduct(principal.orgId, body);
  }

  @Put('fito-products/:id')
  updateFitoProduct(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(FitoProductUpdateSchema)) body: FitoProductUpdateDto,
  ) {
    return this.svc.updateFitoProduct(principal.orgId, id, body);
  }

  @Delete('fito-products/:id')
  deleteFitoProduct(
    @CurrentPrincipal() principal: Principal,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.svc.deleteFitoProduct(principal.orgId, id);
  }
}
