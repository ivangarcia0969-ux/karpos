import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import {
  FieldLogService,
  ListOperationsQuerySchema,
  LogOperationSchema,
} from './field-log.service.js';
import type { ListOperationsQuery, LogOperationDto } from './field-log.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

@Controller('/v1/field-operations')
export class FieldLogController {
  constructor(private readonly svc: FieldLogService) {}

  @Get()
  list(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ListOperationsQuerySchema)) query: ListOperationsQuery,
  ) {
    return this.svc.list(principal, query);
  }

  @Get(':id')
  get(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.get(principal, id);
  }

  @Post()
  log(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(LogOperationSchema)) body: LogOperationDto,
  ) {
    return this.svc.log(principal, body);
  }
}
