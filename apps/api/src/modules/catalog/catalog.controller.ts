import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { Public } from '../../iam/decorators/public.decorator.js';

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
}
