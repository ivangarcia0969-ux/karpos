import { Body, Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../iam/decorators/public.decorator.js';
import { Permissions } from '../../iam/decorators/permissions.decorator.js';
import { CurrentPrincipal } from '../../iam/decorators/current-principal.decorator.js';
import type { Principal } from '../../iam/auth.service.js';
import { BillingService } from './billing.service.js';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Public()
  @Post('webhooks/stripe')
  stripeWebhook(@Req() req: { rawBody: Buffer }, @Headers('stripe-signature') signature: string) {
    return this.service.handleStripeWebhook(req.rawBody, signature);
  }

  @ApiBearerAuth()
  @Permissions('billing:admin')
  @Post('checkout')
  checkout(
    @CurrentPrincipal() principal: Principal,
    @Body() body: { planCode: string; successUrl: string; cancelUrl: string },
  ) {
    return this.service.createCheckoutSession(
      principal.orgId,
      body.planCode,
      body.successUrl,
      body.cancelUrl,
    );
  }
}
