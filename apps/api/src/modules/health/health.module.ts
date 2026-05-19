import { Module } from '@nestjs/common';
import { HealthService } from './health.service.js';
import { HealthSanidadController } from './health.controller.js';

@Module({
  providers: [HealthService],
  controllers: [HealthSanidadController],
})
export class HealthModule {}
