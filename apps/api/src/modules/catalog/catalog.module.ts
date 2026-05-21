import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';
import { CatalogController } from './catalog.controller.js';

@Module({
  providers: [CatalogService],
  controllers: [CatalogController],
})
export class CatalogModule {}
