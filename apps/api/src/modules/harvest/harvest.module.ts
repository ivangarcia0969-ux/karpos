import { Module } from '@nestjs/common';
import { HarvestController } from './harvest.controller.js';
import { HarvestService } from './harvest.service.js';

@Module({
  controllers: [HarvestController],
  providers: [HarvestService],
  exports: [HarvestService],
})
export class HarvestModule {}
