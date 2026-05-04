import { uuid, text, timestamp, integer, numeric, jsonb, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const phenologyProfiles = karpos.table('phenology_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  speciesId: uuid('species_id').notNull(),
  varietyId: uuid('variety_id'),
  name: text('name').notNull(),
  baseTempC: numeric('base_temp_c', { precision: 4, scale: 1 }).notNull().default('10.0'),
  upperTempC: numeric('upper_temp_c', { precision: 4, scale: 1 }),
  gddMethod: text('gdd_method').notNull().default('single_triangle'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const phenologyProfileStages = karpos.table('phenology_profile_stages', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => phenologyProfiles.id, { onDelete: 'cascade' }),
  bbchCode: text('bbch_code').notNull(),
  expectedGdd: numeric('expected_gdd', { precision: 8, scale: 2 }),
  expectedDoyFrom: integer('expected_doy_from'),
  expectedDoyTo: integer('expected_doy_to'),
  alertWindowDays: integer('alert_window_days'),
  notes: text('notes'),
  position: integer('position').notNull(),
});

export const phenologyEvents = karpos.table('phenology_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
  bbchCode: text('bbch_code').notNull(),
  observedPct: numeric('observed_pct', { precision: 5, scale: 2 }),
  observerId: uuid('observer_id'),
  notes: text('notes'),
  attachments: jsonb('attachments').notNull().default([]),
  source: text('source').notNull().default('manual'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const gddDaily = karpos.table('gdd_daily', {
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  observedOn: date('observed_on').notNull(),
  tminC: numeric('tmin_c', { precision: 5, scale: 2 }),
  tmaxC: numeric('tmax_c', { precision: 5, scale: 2 }),
  gdd: numeric('gdd', { precision: 8, scale: 3 }).notNull(),
  cumulativeGdd: numeric('cumulative_gdd', { precision: 10, scale: 3 }),
  baseTempC: numeric('base_temp_c', { precision: 4, scale: 1 }).notNull(),
  source: text('source').notNull(),
});

export type PhenologyProfile = typeof phenologyProfiles.$inferSelect;
export type PhenologyEvent = typeof phenologyEvents.$inferSelect;
export type NewPhenologyEvent = typeof phenologyEvents.$inferInsert;
