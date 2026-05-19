import { uuid, text, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const fieldOperations = karpos.table('field_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  operationType: text('operation_type').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  areaHa: numeric('area_ha', { precision: 10, scale: 3 }),
  notes: text('notes'),
  inputs: jsonb('inputs').notNull().default([]),
  recordedBy: uuid('recorded_by'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type FieldOperation = typeof fieldOperations.$inferSelect;
export type NewFieldOperation = typeof fieldOperations.$inferInsert;
