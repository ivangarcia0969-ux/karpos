import { Module } from '@nestjs/common';
import { PhenologyService } from './phenology.service.js';
import { PhenologyController } from './phenology.controller.js';

@Module({
  providers: [PhenologyService],
  controllers: [PhenologyController],
})
export class PhenologyModule {}
