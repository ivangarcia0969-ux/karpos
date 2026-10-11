import { uuid, text, timestamp, date, numeric } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';
import { users } from './iam.js';
import { farms, plots } from './farms.js';

export const workOrders = karpos.table('work_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  farmId: uuid('farm_id').notNull(),
  code: text('code').notNull(),
  plannedDate: date('planned_date').notNull(),
  status: text('status').notNull().default('PENDING'),
  operationType: text('operation_type').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assignments = karpos.table('assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  workOrderId: uuid('work_order_id').notNull(),
  plotId: uuid('plot_id').notNull(),
  assigneeId: uuid('assignee_id'),
  supervisorId: uuid('supervisor_id'),
  status: text('status').notNull().default('ASSIGNED'),
  assignedAreaHa: numeric('assigned_area_ha', { precision: 10, scale: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const executions = karpos.table('executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  assignmentId: uuid('assignment_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  executedAreaHa: numeric('executed_area_ha', { precision: 10, scale: 3 }),
  status: text('status').notNull().default('EN_EJECUCION'),
  signatureUrl: text('signature_url'),
  receiptUrl: text('receipt_url'),
  verifiedBy: uuid('verified_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type WorkOrder = typeof workOrders.$inferSelect;
export type NewWorkOrder = typeof workOrders.$inferInsert;
export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;
export type Execution = typeof executions.$inferSelect;
export type NewExecution = typeof executions.$inferInsert;
