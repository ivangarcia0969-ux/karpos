import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { cropSpecies, varieties } from '../../database/schema/catalog.js';

@Injectable()
export class CatalogService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  listSpecies() {
    return this.db.select().from(cropSpecies).orderBy(cropSpecies.commonNameEs);
  }

  listVarieties(speciesId?: string) {
    return this.db
      .select()
      .from(varieties)
      .where(speciesId ? eq(varieties.speciesId, speciesId) : undefined)
      .orderBy(varieties.name);
  }
}
