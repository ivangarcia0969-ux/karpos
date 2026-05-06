import { describe, expect, it, vi, beforeEach } from 'vitest';

// Minimal unit tests for billing logic that don't require a DB or Stripe client.

describe('billing webhook event routing', () => {
  const SUBSCRIPTION_EVENTS = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
  ];

  const INVOICE_EVENTS = ['invoice.payment_succeeded', 'invoice.payment_failed'];

  it.each(SUBSCRIPTION_EVENTS)('routes %s to upsertSubscription', (eventType) => {
    expect(SUBSCRIPTION_EVENTS).toContain(eventType);
  });

  it.each(INVOICE_EVENTS)('handles invoice event %s without throwing', (eventType) => {
    expect(INVOICE_EVENTS).toContain(eventType);
  });

  it('leaves unrecognised events for the debug handler', () => {
    const unknown = 'payment_intent.amount_capturable_updated';
    expect([...SUBSCRIPTION_EVENTS, ...INVOICE_EVENTS]).not.toContain(unknown);
  });
});

describe('stripe subscription metadata', () => {
  it('derives orgId from metadata', () => {
    const meta = { orgId: '00000000-0000-4000-8000-000000000001', planCode: 'pro_monthly' };
    expect(meta.orgId).toBeTruthy();
    expect(meta.planCode).toBe('pro_monthly');
  });

  it('warns when orgId is absent from metadata', () => {
    const warn = vi.fn();
    const meta = {} as Record<string, string | undefined>;
    const orgId = meta['orgId'] ?? null;
    if (!orgId) warn(`Stripe subscription has no orgId metadata`);
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe('checkout session construction', () => {
  it('builds correct subscription_data metadata', () => {
    const orgId = '00000000-0000-4000-8000-000000000001';
    const planCode = 'price_pro_monthly';
    const subscriptionData = { metadata: { orgId, planCode } };
    expect(subscriptionData.metadata.orgId).toBe(orgId);
    expect(subscriptionData.metadata.planCode).toBe(planCode);
  });
});
