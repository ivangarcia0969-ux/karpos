import { Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { eq, sql } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { subscriptions, organizations } from '../../database/schema/organizations.js';
import { loadEnv } from '../../config/env.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string | null;

  constructor(@Inject(DRIZZLE) private readonly db: Database) {
    const env = loadEnv();
    this.stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }) : null;
    this.webhookSecret = env.STRIPE_WEBHOOK_SECRET ?? null;
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe || !this.webhookSecret) {
      throw new BadRequestException('stripe_not_configured');
    }
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await this.upsertSubscription(sub);
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        this.logger.log(`Invoice event: ${event.type} for ${event.data.object.id ?? 'unknown'}`);
        break;
      default:
        this.logger.debug(`Unhandled stripe event ${event.type}`);
    }
    return { received: true };
  }

  async createCheckoutSession(orgId: string, planCode: string, successUrl: string, cancelUrl: string) {
    if (!this.stripe) throw new BadRequestException('stripe_not_configured');
    const [org] = await this.db.select().from(organizations).where(eq(organizations.id, orgId));
    if (!org) throw new BadRequestException('org_not_found');

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: org.billingEmail ?? undefined,
      line_items: [{ price: planCode, quantity: 1 }],
      subscription_data: { metadata: { orgId, planCode } },
      metadata: { orgId, planCode },
    });
    return { url: session.url, id: session.id };
  }

  private async upsertSubscription(sub: Stripe.Subscription) {
    const orgId = (sub.metadata?.orgId ?? null) as string | null;
    if (!orgId) {
      this.logger.warn(`Stripe subscription ${sub.id} has no orgId metadata`);
      return;
    }
    await this.db.execute(sql`
      INSERT INTO karpos.subscriptions
        (org_id, plan_code, billing_provider, external_id, status, current_period_start, current_period_end, cancel_at, trial_end, metadata)
      VALUES
        (${orgId}, ${sub.metadata?.planCode ?? 'unknown'}, 'stripe', ${sub.id}, ${sub.status},
         to_timestamp(${sub.current_period_start}), to_timestamp(${sub.current_period_end}),
         ${sub.cancel_at ? `to_timestamp(${sub.cancel_at})` : null}::timestamptz,
         ${sub.trial_end ? `to_timestamp(${sub.trial_end})` : null}::timestamptz,
         ${JSON.stringify(sub.metadata ?? {})}::jsonb)
      ON CONFLICT (external_id) DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at = EXCLUDED.cancel_at,
        trial_end = EXCLUDED.trial_end,
        updated_at = now()
    `);
  }
}
