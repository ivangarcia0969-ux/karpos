import { pgSchema, uuid, text } from 'drizzle-orm/pg-core';

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

export type CropSpecies = typeof cropSpecies.$inferSelect;
export type Variety = typeof varieties.$inferSelect;
