import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Principal } from '../auth.service.js';

export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Principal => ctx.switchToHttp().getRequest().principal,
);
