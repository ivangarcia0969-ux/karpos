import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service.js';
import { Public } from './decorators/public.decorator.js';
import { CurrentPrincipal } from './decorators/current-principal.decorator.js';
import type { Principal } from './auth.service.js';
import { loadEnv } from '../config/env.js';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(120),
  organization: z.object({
    legalName: z.string().min(2).max(180),
    displayName: z.string().min(2).max(120),
    slug: z
      .string()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, hyphens'),
    countryCode: z.string().length(2).toUpperCase(),
  }),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

@Controller('/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  async register(
    @Body(new ZodValidationPipe(RegisterSchema)) body: z.infer<typeof RegisterSchema>,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { token, principal } = await this.auth.register(body);
    this.setCookie(res, token);
    return { principal };
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginSchema)) body: z.infer<typeof LoginSchema>,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { token, principal } = await this.auth.login(body.email, body.password);
    this.setCookie(res, token);
    return { principal };
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    const env = loadEnv();
    res.clearCookie(env.COOKIE_NAME, { path: '/' });
  }

  @Get('me')
  async me(@CurrentPrincipal() principal: Principal) {
    return { principal };
  }

  private setCookie(res: FastifyReply, token: string) {
    const env = loadEnv();
    res.setCookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: 'lax',
      path: '/',
      domain: env.COOKIE_DOMAIN,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
}
