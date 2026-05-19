import { uuid, text, timestamp, integer, numeric, jsonb, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const pestScoutings = karpos.table('pest_scoutings', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  observedOn: date('observed_on').notNull(),
  observerId: uuid('observer_id'),
  target: text('target').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull(),
  incidencePct: numeric('incidence_pct', { precision: 5, scale: 2 }),
  sampleSize: integer('sample_size'),
  stageBbch: text('stage_bbch'),
  notes: text('notes'),
  photos: jsonb('photos').notNull().default([]),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sprayRecords = karpos.table('spray_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  scoutingId: uuid('scouting_id'),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  operator: text('operator').notNull(),
  target: text('target'),
  productName: text('product_name').notNull(),
  activeIngredient: text('active_ingredient').notNull(),
  registrationNo: text('registration_no'),
  doseAmount: numeric('dose_amount', { precision: 12, scale: 4 }).notNull(),
  doseUnit: text('dose_unit').notNull(),
  waterLPerHa: numeric('water_l_per_ha', { precision: 10, scale: 2 }),
  areaHa: numeric('area_ha', { precision: 10, scale: 3 }).notNull(),
  phiDays: integer('phi_days').notNull(),
  reiHours: integer('rei_hours'),
  equipment: text('equipment'),
  windKmh: numeric('wind_kmh', { precision: 5, scale: 2 }),
  tempC: numeric('temp_c', { precision: 5, scale: 2 }),
  rhPct: numeric('rh_pct', { precision: 5, scale: 2 }),
  notes: text('notes'),
  metadata: jsonb('metadata').notNull().default({}),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  voidedBy: uuid('voided_by'),
  voidReason: text('void_reason'),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PestScouting = typeof pestScoutings.$inferSelect;
export type NewPestScouting = typeof pestScoutings.$inferInsert;
export type SprayRecord = typeof sprayRecords.$inferSelect;
export type NewSprayRecord = typeof sprayRecords.$inferInsert;
