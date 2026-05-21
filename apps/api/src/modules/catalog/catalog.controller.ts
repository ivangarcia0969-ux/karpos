import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { Public } from '../../iam/decorators/public.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';

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
}
