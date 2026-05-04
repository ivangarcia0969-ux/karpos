import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import {
  FieldLogService,
  LogOperationDto,
  LogOperationSchema,
  ListOperationsQuery,
  ListOperationsQuerySchema,
} from './field-log.service.js';

@ApiTags('bitacora-verde')
@ApiBearerAuth()
@Controller('field-operations')
export class FieldLogController {
  constructor(private readonly service: FieldLogService) {}

  @Get()
  @Permissions('field-log:read')
  list(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ListOperationsQuerySchema)) query: ListOperationsQuery,
  ) {
    return this.service.list(principal, query);
  }

  @Post()
  @Permissions('field-log:write')
  log(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(LogOperationSchema)) dto: LogOperationDto,
  ) {
    return this.service.log(principal, dto);
  }
}
