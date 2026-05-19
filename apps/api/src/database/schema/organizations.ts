import { pgSchema, uuid, text, timestamp, jsonb, char } from 'drizzle-orm/pg-core';

export const karpos = pgSchema('karpos');

export const organizations = karpos.table('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  legalName: text('legal_name').notNull(),
  displayName: text('display_name').notNull(),
  slug: text('slug').notNull().unique(),
  countryCode: char('country_code', { length: 2 }).notNull(),
  defaultLocale: text('default_locale').notNull().default('es-CO'),
  defaultCurrency: char('default_currency', { length: 3 }).notNull().default('COP'),
  defaultTimezone: text('default_timezone').notNull().default('America/Bogota'),
  taxId: text('tax_id'),
  billingEmail: text('billing_email'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
