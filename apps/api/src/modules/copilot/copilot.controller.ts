import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/zod-validation.pipe.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { AskDto, AskSchema, CopilotService } from './copilot.service.js';

@ApiTags('karpos-iq')
@ApiBearerAuth()
@Controller('copilot')
export class CopilotController {
  constructor(private readonly service: CopilotService) {}

  @Get('sessions')
  @Permissions('copilot:use')
  listSessions(@CurrentPrincipal() principal: Principal) {
    return this.service.listSessions(principal);
  }

  @Post('ask')
  @Permissions('copilot:use')
  ask(
    @CurrentPrincipal() principal: Principal,
    @Body(new ZodValidationPipe(AskSchema)) dto: AskDto,
  ) {
    return this.service.ask(principal, dto);
  }
}
