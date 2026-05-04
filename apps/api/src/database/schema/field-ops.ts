import { uuid, text, timestamp, integer, numeric, jsonb, char, customType, date } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

const geographyPoint = customType<{ data: string }>({ dataType: () => 'geography(Point,4326)' });

export const crews = karpos.table('crews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  name: text('name').notNull(),
  leaderName: text('leader_name'),
  contractor: text('contractor'),
  defaultHourlyRate: numeric('default_hourly_rate', { precision: 10, scale: 2 }),
  currency: char('currency', { length: 3 }).notNull().default('USD'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workers = karpos.table('workers', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  crewId: uuid('crew_id').references(() => crews.id, { onDelete: 'set null' }),
  documentId: text('document_id'),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  pieceworkRate: numeric('piecework_rate', { precision: 10, scale: 4 }),
  hireDate: date('hire_date'),
  active: text('active').notNull().default('true'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fieldOperations = karpos.table('field_operations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  operationTypeId: uuid('operation_type_id').notNull(),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  crewId: uuid('crew_id'),
  workersCount: integer('workers_count'),
  areaCoveredHa: numeric('area_covered_ha', { precision: 10, scale: 3 }),
  outputQuantity: numeric('output_quantity', { precision: 12, scale: 3 }),
  outputUnit: text('output_unit'),
  costAmount: numeric('cost_amount', { precision: 12, scale: 2 }),
  costCurrency: char('cost_currency', { length: 3 }),
  geom: geographyPoint('geom'),
  notes: text('notes'),
  attachments: jsonb('attachments').notNull().default([]),
  metadata: jsonb('metadata').notNull().default({}),
  recordedBy: uuid('recorded_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const workerOutputs = karpos.table('worker_outputs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  fieldOperationId: uuid('field_operation_id').notNull().references(() => fieldOperations.id, { onDelete: 'cascade' }),
  workerId: uuid('worker_id').notNull(),
  hours: numeric('hours', { precision: 6, scale: 2 }),
  units: numeric('units', { precision: 12, scale: 3 }),
  unit: text('unit'),
  amountPaid: numeric('amount_paid', { precision: 12, scale: 2 }),
  currency: char('currency', { length: 3 }),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Crew = typeof crews.$inferSelect;
export type Worker = typeof workers.$inferSelect;
export type FieldOperation = typeof fieldOperations.$inferSelect;
export type NewFieldOperation = typeof fieldOperations.$inferInsert;
