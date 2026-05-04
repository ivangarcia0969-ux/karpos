import { Module } from '@nestjs/common';
import { FarmsController } from './farms.controller.js';
import { PlotsController } from './plots.controller.js';
import { FarmsService } from './farms.service.js';
import { PlotsService } from './plots.service.js';

@Module({
  controllers: [FarmsController, PlotsController],
  providers: [FarmsService, PlotsService],
  exports: [FarmsService, PlotsService],
})
export class FarmsModule {}
