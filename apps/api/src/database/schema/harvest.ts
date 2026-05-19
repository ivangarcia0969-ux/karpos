import { uuid, text, timestamp, integer, numeric, jsonb, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const harvestPlans = karpos.table('harvest_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  seasonYear: integer('season_year').notNull(),
  expectedStartDate: date('expected_start_date'),
  expectedEndDate: date('expected_end_date'),
  expectedYieldKg: numeric('expected_yield_kg', { precision: 14, scale: 2 }),
  expectedYieldKgHa: numeric('expected_yield_kg_ha', { precision: 10, scale: 2 }),
  forecastMethod: text('forecast_method'),
  forecastMetadata: jsonb('forecast_metadata').notNull().default({}),
  status: text('status').notNull().default('draft'),
  notes: text('notes'),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const harvestLots = karpos.table('harvest_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  planId: uuid('plan_id'),
  lotCode: text('lot_code').notNull(),
  harvestedOn: date('harvested_on').notNull(),
  varietyId: uuid('variety_id'),
  netWeightKg: numeric('net_weight_kg', { precision: 12, scale: 2 }),
  grossKg: numeric('gross_kg', { precision: 12, scale: 2 }),
  tareKg: numeric('tare_kg', { precision: 12, scale: 2 }).default('0'),
  containersCount: integer('containers_count'),
  qualityGrade: text('quality_grade'),
  destination: text('destination'),
  notes: text('notes'),
  recordedBy: uuid('recorded_by'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HarvestPlan = typeof harvestPlans.$inferSelect;
export type NewHarvestPlan = typeof harvestPlans.$inferInsert;
export type HarvestLot = typeof harvestLots.$inferSelect;
export type NewHarvestLot = typeof harvestLots.$inferInsert;
