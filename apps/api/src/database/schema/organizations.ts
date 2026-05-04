import { pgSchema, uuid, text, timestamp, boolean, integer, numeric, jsonb, char, date } from 'drizzle-orm/pg-core';

export const karpos = pgSchema('karpos');

export const organizations = karpos.table('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  displayName: text('display_name').notNull(),
  slug: text('slug').notNull().unique(),
  countryCode: char('country_code', { length: 2 }).notNull(),
  defaultLocale: text('default_locale').notNull().default('es-CO'),
  defaultCurrency: char('default_currency', { length: 3 }).notNull().default('USD'),
  defaultTimezone: text('default_timezone').notNull().default('America/Bogota'),
  taxId: text('tax_id'),
  billingEmail: text('billing_email'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const subscriptions = karpos.table('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  planCode: text('plan_code').notNull(),
  billingProvider: text('billing_provider').notNull(),
  externalId: text('external_id'),
  status: text('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelAt: timestamp('cancel_at', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = karpos.table('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  subscriptionId: uuid('subscription_id'),
  number: text('number'),
  status: text('status').notNull(),
  amountDue: numeric('amount_due', { precision: 12, scale: 2 }).notNull(),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }).notNull().default('0'),
  currency: char('currency', { length: 3 }).notNull(),
  dueAt: timestamp('due_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  pdfUrl: text('pdf_url'),
  externalId: text('external_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usageMeters = karpos.table('usage_meters', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  meter: text('meter').notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  valueNumeric: numeric('value_numeric', { precision: 20, scale: 4 }).notNull().default('0'),
  metadata: jsonb('metadata').notNull().default({}),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
