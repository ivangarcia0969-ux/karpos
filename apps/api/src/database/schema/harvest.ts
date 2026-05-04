import { uuid, text, timestamp, integer, numeric, jsonb, customType, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

const geographyPoint = customType<{ data: string }>({ dataType: () => 'geography(Point,4326)' });

export const harvestPlans = karpos.table('harvest_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  seasonYear: integer('season_year').notNull(),
  plotId: uuid('plot_id').notNull(),
  expectedStartDate: date('expected_start_date'),
  expectedEndDate: date('expected_end_date'),
  expectedYieldKg: numeric('expected_yield_kg', { precision: 14, scale: 2 }),
  expectedYieldKgHa: numeric('expected_yield_kg_ha', { precision: 12, scale: 2 }),
  forecastMethod: text('forecast_method'),
  forecastMetadata: jsonb('forecast_metadata').notNull().default({}),
  status: text('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const harvestLots = karpos.table('harvest_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  planId: uuid('plan_id'),
  plotId: uuid('plot_id').notNull(),
  lotCode: text('lot_code').notNull(),
  harvestedOn: date('harvested_on').notNull(),
  harvestedAt: timestamp('harvested_at', { withTimezone: true }),
  varietyId: uuid('variety_id'),
  crewId: uuid('crew_id'),
  grossKg: numeric('gross_kg', { precision: 14, scale: 2 }).notNull().default('0'),
  tareKg: numeric('tare_kg', { precision: 14, scale: 2 }).notNull().default('0'),
  containersCount: integer('containers_count'),
  containerAvgKg: numeric('container_avg_kg', { precision: 10, scale: 2 }),
  qualityGrade: text('quality_grade'),
  status: text('status').notNull().default('open'),
  voidedReason: text('voided_reason'),
  geom: geographyPoint('geom'),
  notes: text('notes'),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const weighbridgeTickets = karpos.table('weighbridge_tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  lotId: uuid('lot_id').notNull().references(() => harvestLots.id, { onDelete: 'cascade' }),
  ticketNumber: text('ticket_number').notNull(),
  scaleId: text('scale_id'),
  weighedAt: timestamp('weighed_at', { withTimezone: true }).notNull(),
  vehiclePlate: text('vehicle_plate'),
  driver: text('driver'),
  grossKg: numeric('gross_kg', { precision: 14, scale: 2 }).notNull(),
  tareKg: numeric('tare_kg', { precision: 14, scale: 2 }).notNull(),
  attachments: jsonb('attachments').notNull().default([]),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type HarvestPlan = typeof harvestPlans.$inferSelect;
export type HarvestLot = typeof harvestLots.$inferSelect;
export type NewHarvestLot = typeof harvestLots.$inferInsert;
export type WeighbridgeTicket = typeof weighbridgeTickets.$inferSelect;
