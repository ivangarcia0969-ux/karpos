import { Module } from '@nestjs/common';
import { FieldLogService } from './field-log.service.js';
import { FieldLogController } from './field-log.controller.js';

@Module({
  providers: [FieldLogService],
  controllers: [FieldLogController],
})
export class FieldLogModule {}
