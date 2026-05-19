import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { AuthService } from '../auth.service.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { loadEnv } from '../../config/env.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<FastifyRequest>();
    const env = loadEnv();

    const cookieToken = (req as unknown as { cookies?: Record<string, string> }).cookies?.[env.COOKIE_NAME];
    const header = req.headers?.authorization;
    const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

    const token = cookieToken ?? bearerToken;
    if (!token) throw new UnauthorizedException('missing_token');

    (req as unknown as { principal: unknown }).principal = await this.auth.verifyToken(token);
    return true;
  }
}
