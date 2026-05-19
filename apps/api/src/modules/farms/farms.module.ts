import { Module } from '@nestjs/common';
import { FarmsService } from './farms.service.js';
import { FarmsController } from './farms.controller.js';
import { PlotsService } from './plots.service.js';
import { PlotsController } from './plots.controller.js';

@Module({
  providers: [FarmsService, PlotsService],
  controllers: [FarmsController, PlotsController],
})
export class FarmsModule {}
