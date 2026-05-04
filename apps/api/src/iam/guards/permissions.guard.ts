import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const req = context.switchToHttp().getRequest();
    const principal = req.principal as { permissions?: string[] } | undefined;
    const granted = principal?.permissions ?? [];

    const ok = required.every((p) => granted.includes(p) || granted.includes('*'));
    if (!ok) throw new ForbiddenException(`missing_permissions:${required.join(',')}`);
    return true;
  }
}
