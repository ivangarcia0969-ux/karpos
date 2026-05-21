import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or, isNull, ilike, sql } from 'drizzle-orm';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { cropSpecies, varieties, fitoProducts } from '../../database/schema/catalog.js';

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

  listFitoProducts(opts: { orgId?: string; category?: string; q?: string; cropCode?: string } = {}) {
    const conds = [eq(fitoProducts.isActive, true)];
    if (opts.orgId) conds.push(or(isNull(fitoProducts.orgId), eq(fitoProducts.orgId, opts.orgId))!);
    else conds.push(isNull(fitoProducts.orgId));
    if (opts.category) conds.push(eq(fitoProducts.category, opts.category));
    if (opts.q) {
      conds.push(
        or(
          ilike(fitoProducts.commercialName, `%${opts.q}%`),
          ilike(fitoProducts.activeIngredient, `%${opts.q}%`),
          ilike(fitoProducts.registrationNo, `%${opts.q}%`),
        )!,
      );
    }
    if (opts.cropCode) {
      conds.push(sql`${opts.cropCode} = ANY(${fitoProducts.targetCrops})`);
    }
    return this.db
      .select()
      .from(fitoProducts)
      .where(and(...conds))
      .orderBy(fitoProducts.commercialName);
  }
}
