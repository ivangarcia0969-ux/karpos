import { Module } from '@nestjs/common';
import { FieldLogController } from './field-log.controller.js';
import { FieldLogService } from './field-log.service.js';

@Module({
  controllers: [FieldLogController],
  providers: [FieldLogService],
  exports: [FieldLogService],
})
export class FieldLogModule {}
