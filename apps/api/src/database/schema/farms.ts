import { uuid, text, timestamp, integer, numeric, jsonb, char, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const farms = karpos.table('farms', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  countryCode: char('country_code', { length: 2 }).notNull(),
  region: text('region'),
  locality: text('locality'),
  timezone: text('timezone').notNull().default('America/Bogota'),
  elevationM: integer('elevation_m'),
  totalAreaHa: numeric('total_area_ha', { precision: 10, scale: 3 }),
  centroid: jsonb('centroid'),
  boundary: jsonb('boundary'),
  contact: jsonb('contact').notNull().default({}),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const plots = karpos.table('plots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  farmId: uuid('farm_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  speciesId: uuid('species_id'),
  varietyId: uuid('variety_id'),
  plantingDate: date('planting_date'),
  spacingRowM: numeric('spacing_row_m', { precision: 6, scale: 2 }),
  spacingTreeM: numeric('spacing_tree_m', { precision: 6, scale: 2 }),
  treesCount: integer('trees_count'),
  areaHa: numeric('area_ha', { precision: 10, scale: 3 }),
  boundary: jsonb('boundary'),
  centroid: jsonb('centroid'),
  status: text('status').notNull().default('active'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;
export type Plot = typeof plots.$inferSelect;
export type NewPlot = typeof plots.$inferInsert;
