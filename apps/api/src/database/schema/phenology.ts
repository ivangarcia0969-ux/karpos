import { uuid, text, timestamp, numeric, jsonb, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const phenologyEvents = karpos.table('phenology_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  observedOn: date('observed_on').notNull(),
  bbchCode: text('bbch_code').notNull(),
  stageLabel: text('stage_label'),
  pctInStage: numeric('pct_in_stage', { precision: 5, scale: 2 }),
  notes: text('notes'),
  recordedBy: uuid('recorded_by'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type PhenologyEvent = typeof phenologyEvents.$inferSelect;
export type NewPhenologyEvent = typeof phenologyEvents.$inferInsert;
