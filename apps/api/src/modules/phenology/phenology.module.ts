import { Module } from '@nestjs/common';
import { PhenologyController } from './phenology.controller.js';
import { PhenologyService } from './phenology.service.js';

@Module({
  controllers: [PhenologyController],
  providers: [PhenologyService],
  exports: [PhenologyService],
})
export class PhenologyModule {}
