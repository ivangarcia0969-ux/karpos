import { pgSchema, uuid, text, integer, numeric, boolean, timestamp } from 'drizzle-orm/pg-core';

export const catalog = pgSchema('catalog');

export const cropSpecies = catalog.table('crop_species', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  scientificName: text('scientific_name').notNull(),
  commonNameEs: text('common_name_es').notNull(),
  commonNameEn: text('common_name_en').notNull(),
  family: text('family'),
  category: text('category'),
});

export const varieties = catalog.table('varieties', {
  id: uuid('id').primaryKey().defaultRandom(),
  speciesId: uuid('species_id').notNull(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  originCountry: text('origin_country'),
  notes: text('notes'),
});

export const fitoProducts = catalog.table('fito_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id'),
  commercialName: text('commercial_name').notNull(),
  activeIngredient: text('active_ingredient').notNull(),
  registrationNo: text('registration_no'),
  registrationCountry: text('registration_country').default('CO'),
  formulationType: text('formulation_type'),
  category: text('category').notNull(),
  toxicologyClass: text('toxicology_class'),
  defaultPhiDays: integer('default_phi_days').notNull().default(0),
  defaultReiHours: integer('default_rei_hours'),
  recommendedDoseMin: numeric('recommended_dose_min', { precision: 12, scale: 4 }),
  recommendedDoseMax: numeric('recommended_dose_max', { precision: 12, scale: 4 }),
  doseUnit: text('dose_unit'),
  targetPests: text('target_pests').array().notNull().default([]),
  targetCrops: text('target_crops').array().notNull().default([]),
  modeOfAction: text('mode_of_action'),
  groupCode: text('group_code'),
  manufacturer: text('manufacturer'),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  clonedFromId: uuid('cloned_from_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CropSpecies = typeof cropSpecies.$inferSelect;
export type Variety = typeof varieties.$inferSelect;
export type FitoProduct = typeof fitoProducts.$inferSelect;
