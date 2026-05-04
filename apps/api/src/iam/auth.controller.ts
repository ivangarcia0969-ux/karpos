import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from './decorators/current-principal.decorator.js';
import type { Principal } from './auth.service.js';

@ApiTags('iam')
@ApiBearerAuth()
@Controller('me')
export class AuthController {
  @Get()
  me(@CurrentPrincipal() principal: Principal) {
    return principal;
  }
}
