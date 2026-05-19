import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { z } from 'zod';
import { PhenologyService, RecordEventSchema } from './phenology.service.js';
import type { RecordEventDto } from './phenology.service.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';

const ListQuerySchema = z.object({ plotId: z.string().uuid() });

@Controller('/v1/phenology/events')
export class PhenologyController {
  constructor(private readonly svc: PhenologyService) {}

  @Get()
  list(
    @CurrentPrincipal() principal: Principal,
    @Query(new ZodValidationPipe(ListQuerySchema)) query: z.infer<typeof ListQuerySchema>,
  ) {
    return this.svc.list(principal, query.plotId);
  }

  @Post()
  record(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(RecordEventSchema)) body: RecordEventDto,
  ) {
    return this.svc.record(principal, body);
  }

  @Delete(':id')
  remove(@CurrentPrincipal() principal: Principal, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.remove(principal, id);
  }
}
