import { uuid, text, timestamp, integer, numeric, jsonb, char, date, customType } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

const geography = (name: string) =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      return 'geography(Geometry,4326)';
    },
  })(name);

export const farms = karpos.table('farms', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  countryCode: char('country_code', { length: 2 }).notNull(),
  region: text('region'),
  locality: text('locality'),
  timezone: text('timezone').notNull(),
  elevationM: integer('elevation_m'),
  totalAreaHa: numeric('total_area_ha', { precision: 10, scale: 3 }),
  centroid: geography('centroid'),
  boundary: geography('boundary'),
  contact: jsonb('contact').notNull().default({}),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sectors = karpos.table('sectors', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  farmId: uuid('farm_id').notNull().references(() => farms.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  name: text('name').notNull(),
  areaHa: numeric('area_ha', { precision: 10, scale: 3 }),
  boundary: geography('boundary'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const plots = karpos.table('plots', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  farmId: uuid('farm_id').notNull().references(() => farms.id, { onDelete: 'cascade' }),
  sectorId: uuid('sector_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  speciesId: uuid('species_id').notNull(),
  varietyId: uuid('variety_id'),
  rootstockId: uuid('rootstock_id'),
  trainingSystemId: uuid('training_system_id'),
  plantingDate: date('planting_date'),
  spacingRowM: numeric('spacing_row_m', { precision: 6, scale: 2 }),
  spacingTreeM: numeric('spacing_tree_m', { precision: 6, scale: 2 }),
  treesCount: integer('trees_count'),
  areaHa: numeric('area_ha', { precision: 10, scale: 3 }),
  boundary: geography('boundary'),
  centroid: geography('centroid'),
  status: text('status').notNull().default('active'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const trees = karpos.table('trees', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  plotId: uuid('plot_id').notNull().references(() => plots.id, { onDelete: 'cascade' }),
  rowNumber: integer('row_number'),
  positionInRow: integer('position_in_row'),
  varietyId: uuid('variety_id'),
  rootstockId: uuid('rootstock_id'),
  plantedAt: date('planted_at'),
  geom: geography('geom'),
  status: text('status').notNull().default('alive'),
  qrCode: text('qr_code').unique(),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;
export type Sector = typeof sectors.$inferSelect;
export type Plot = typeof plots.$inferSelect;
export type NewPlot = typeof plots.$inferInsert;
export type Tree = typeof trees.$inferSelect;
