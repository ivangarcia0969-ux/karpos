import { uuid, text, timestamp, integer, numeric, jsonb, customType, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

const geographyPoint = customType<{ data: string }>({ dataType: () => 'geography(Point,4326)' });

export const pestScoutings = karpos.table('pest_scoutings', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
  observerId: uuid('observer_id'),
  pestTaxonId: uuid('pest_taxon_id').notNull(),
  severityScale: text('severity_scale').notNull(),
  severityValue: numeric('severity_value', { precision: 6, scale: 2 }),
  incidencePct: numeric('incidence_pct', { precision: 5, scale: 2 }),
  sampleSize: integer('sample_size'),
  geom: geographyPoint('geom'),
  notes: text('notes'),
  attachments: jsonb('attachments').notNull().default([]),
  aiDiagnosis: jsonb('ai_diagnosis'),
  source: text('source').notNull().default('manual'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sprayRecords = karpos.table('spray_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  appliedAt: timestamp('applied_at', { withTimezone: true }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  applicatorId: uuid('applicator_id'),
  applicatorName: text('applicator_name'),
  applicatorLicense: text('applicator_license'),
  equipment: text('equipment'),
  areaTreatedHa: numeric('area_treated_ha', { precision: 10, scale: 3 }),
  waterLHa: numeric('water_l_ha', { precision: 10, scale: 2 }),
  weatherTempC: numeric('weather_temp_c', { precision: 5, scale: 2 }),
  weatherRhPct: numeric('weather_rh_pct', { precision: 5, scale: 2 }),
  weatherWindMs: numeric('weather_wind_ms', { precision: 5, scale: 2 }),
  phBefore: numeric('ph_before', { precision: 4, scale: 2 }),
  notes: text('notes'),
  phiUntil: date('phi_until'),
  reiUntil: timestamp('rei_until', { withTimezone: true }),
  status: text('status').notNull().default('applied'),
  voidedReason: text('voided_reason'),
  attachments: jsonb('attachments').notNull().default([]),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sprayRecordItems = karpos.table('spray_record_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sprayRecordId: uuid('spray_record_id').notNull().references(() => sprayRecords.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull(),
  targetTaxonId: uuid('target_taxon_id'),
  doseValue: numeric('dose_value', { precision: 12, scale: 4 }).notNull(),
  doseUnit: text('dose_unit').notNull(),
  totalQuantity: numeric('total_quantity', { precision: 12, scale: 4 }),
  totalUnit: text('total_unit'),
  concentrationGL: numeric('concentration_g_l', { precision: 12, scale: 4 }),
});

export const diseaseAlerts = karpos.table('disease_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  modelCode: text('model_code').notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull(),
  severity: text('severity').notNull(),
  details: jsonb('details').notNull().default({}),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolvedBy: uuid('resolved_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PestScouting = typeof pestScoutings.$inferSelect;
export type SprayRecord = typeof sprayRecords.$inferSelect;
export type NewSprayRecord = typeof sprayRecords.$inferInsert;
export type SprayRecordItem = typeof sprayRecordItems.$inferSelect;
