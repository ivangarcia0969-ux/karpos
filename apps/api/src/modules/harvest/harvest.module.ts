import { Module } from '@nestjs/common';
import { HarvestService } from './harvest.service.js';
import { HarvestController } from './harvest.controller.js';

@Module({
  providers: [HarvestService],
  controllers: [HarvestController],
})
export class HarvestModule {}
