import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, or, isNull, ilike, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { cropSpecies, varieties, fitoProducts } from '../../database/schema/catalog.js';

export const FitoCategoryEnum = z.enum([
  'fungicide',
  'insecticide',
  'acaricide',
  'herbicide',
  'nematicide',
  'bactericide',
  'plant_growth_regulator',
  'biological',
  'adjuvant',
  'fertilizer',
  'other',
]);

export const FitoProductCreateSchema = z.object({
  commercialName: z.string().min(1).max(120),
  activeIngredient: z.string().min(1).max(180),
  registrationNo: z.string().max(60).optional(),
  registrationCountry: z.string().max(3).default('CO'),
  formulationType: z.string().max(10).optional(),
  category: FitoCategoryEnum,
  toxicologyClass: z.enum(['I', 'II', 'III', 'IV']).optional(),
  defaultPhiDays: z.number().int().min(0).max(365).default(0),
  defaultReiHours: z.number().int().min(0).max(720).optional(),
  recommendedDoseMin: z.number().positive().optional(),
  recommendedDoseMax: z.number().positive().optional(),
  doseUnit: z.string().max(20).optional(),
  targetPests: z.array(z.string()).default([]),
  targetCrops: z.array(z.string()).default([]),
  modeOfAction: z.string().max(180).optional(),
  groupCode: z.string().max(20).optional(),
  manufacturer: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});
export type FitoProductCreateDto = z.infer<typeof FitoProductCreateSchema>;

export const FitoProductUpdateSchema = FitoProductCreateSchema.partial();
export type FitoProductUpdateDto = z.infer<typeof FitoProductUpdateSchema>;

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

  async listFitoProducts(opts: { orgId?: string; category?: string; q?: string; cropCode?: string } = {}) {
    // Scope:
    //   - globales (org_id IS NULL) que la org NO ha clonado, +
    //   - propios de la org.
    // Esto evita que aparezca duplicado el "Score 250 EC" global cuando ya lo adoptaste.
    const adoptedSource = opts.orgId
      ? sql<string>`(
          SELECT cloned_from_id::text FROM catalog.fito_products
          WHERE org_id = ${opts.orgId} AND cloned_from_id IS NOT NULL AND is_active = true
        )`
      : null;

    const conds = [eq(fitoProducts.isActive, true)];

    if (opts.orgId) {
      conds.push(
        or(
          and(eq(fitoProducts.orgId, opts.orgId)),
          and(
            isNull(fitoProducts.orgId),
            sql`${fitoProducts.id}::text NOT IN ${adoptedSource}`,
          ),
        )!,
      );
    } else {
      conds.push(isNull(fitoProducts.orgId));
    }

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

  async cloneFitoProduct(orgId: string, sourceId: string) {
    const [source] = await this.db
      .select()
      .from(fitoProducts)
      .where(eq(fitoProducts.id, sourceId));
    if (!source) throw new NotFoundException('source_not_found');
    if (source.orgId !== null) {
      throw new BadRequestException('only_global_products_can_be_cloned');
    }
    const [already] = await this.db
      .select({ id: fitoProducts.id })
      .from(fitoProducts)
      .where(
        and(
          eq(fitoProducts.orgId, orgId),
          eq(fitoProducts.clonedFromId, sourceId),
          eq(fitoProducts.isActive, true),
        ),
      );
    if (already) {
      throw new ConflictException('already_cloned');
    }

    const [row] = await this.db
      .insert(fitoProducts)
      .values({
        orgId,
        clonedFromId: source.id,
        commercialName: source.commercialName,
        activeIngredient: source.activeIngredient,
        registrationNo: source.registrationNo,
        registrationCountry: source.registrationCountry,
        formulationType: source.formulationType,
        category: source.category,
        toxicologyClass: source.toxicologyClass,
        defaultPhiDays: source.defaultPhiDays,
        defaultReiHours: source.defaultReiHours,
        recommendedDoseMin: source.recommendedDoseMin,
        recommendedDoseMax: source.recommendedDoseMax,
        doseUnit: source.doseUnit,
        targetPests: source.targetPests,
        targetCrops: source.targetCrops,
        modeOfAction: source.modeOfAction,
        groupCode: source.groupCode,
        manufacturer: source.manufacturer,
        notes: source.notes,
      })
      .returning();
    return row;
  }

  async getFitoProduct(orgId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(fitoProducts)
      .where(
        and(
          eq(fitoProducts.id, id),
          or(isNull(fitoProducts.orgId), eq(fitoProducts.orgId, orgId))!,
        ),
      );
    if (!row) throw new NotFoundException('fito_product_not_found');
    return row;
  }

  async createFitoProduct(orgId: string, dto: FitoProductCreateDto) {
    try {
      const [row] = await this.db
        .insert(fitoProducts)
        .values({
          orgId,
          commercialName: dto.commercialName,
          activeIngredient: dto.activeIngredient,
          registrationNo: dto.registrationNo,
          registrationCountry: dto.registrationCountry ?? 'CO',
          formulationType: dto.formulationType,
          category: dto.category,
          toxicologyClass: dto.toxicologyClass,
          defaultPhiDays: dto.defaultPhiDays ?? 0,
          defaultReiHours: dto.defaultReiHours,
          recommendedDoseMin: dto.recommendedDoseMin?.toString(),
          recommendedDoseMax: dto.recommendedDoseMax?.toString(),
          doseUnit: dto.doseUnit,
          targetPests: dto.targetPests,
          targetCrops: dto.targetCrops,
          modeOfAction: dto.modeOfAction,
          groupCode: dto.groupCode,
          manufacturer: dto.manufacturer,
          notes: dto.notes,
        })
        .returning();
      return row;
    } catch (e) {
      if ((e as { code?: string }).code === '23505') {
        throw new ConflictException('commercial_name_already_exists');
      }
      throw e;
    }
  }

  async updateFitoProduct(orgId: string, id: string, dto: FitoProductUpdateDto) {
    const [existing] = await this.db
      .select({ id: fitoProducts.id, orgId: fitoProducts.orgId })
      .from(fitoProducts)
      .where(eq(fitoProducts.id, id));
    if (!existing) throw new NotFoundException('fito_product_not_found');
    if (existing.orgId === null) {
      throw new ForbiddenException('cannot_edit_global_product');
    }
    if (existing.orgId !== orgId) {
      throw new ForbiddenException('cannot_edit_other_org_product');
    }

    const [row] = await this.db
      .update(fitoProducts)
      .set({
        ...(dto.commercialName !== undefined && { commercialName: dto.commercialName }),
        ...(dto.activeIngredient !== undefined && { activeIngredient: dto.activeIngredient }),
        ...(dto.registrationNo !== undefined && { registrationNo: dto.registrationNo }),
        ...(dto.registrationCountry !== undefined && { registrationCountry: dto.registrationCountry }),
        ...(dto.formulationType !== undefined && { formulationType: dto.formulationType }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.toxicologyClass !== undefined && { toxicologyClass: dto.toxicologyClass }),
        ...(dto.defaultPhiDays !== undefined && { defaultPhiDays: dto.defaultPhiDays }),
        ...(dto.defaultReiHours !== undefined && { defaultReiHours: dto.defaultReiHours }),
        ...(dto.recommendedDoseMin !== undefined && { recommendedDoseMin: dto.recommendedDoseMin.toString() }),
        ...(dto.recommendedDoseMax !== undefined && { recommendedDoseMax: dto.recommendedDoseMax.toString() }),
        ...(dto.doseUnit !== undefined && { doseUnit: dto.doseUnit }),
        ...(dto.targetPests !== undefined && { targetPests: dto.targetPests }),
        ...(dto.targetCrops !== undefined && { targetCrops: dto.targetCrops }),
        ...(dto.modeOfAction !== undefined && { modeOfAction: dto.modeOfAction }),
        ...(dto.groupCode !== undefined && { groupCode: dto.groupCode }),
        ...(dto.manufacturer !== undefined && { manufacturer: dto.manufacturer }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updatedAt: new Date(),
      })
      .where(eq(fitoProducts.id, id))
      .returning();
    return row;
  }

  async deleteFitoProduct(orgId: string, id: string) {
    const [existing] = await this.db
      .select({ id: fitoProducts.id, orgId: fitoProducts.orgId })
      .from(fitoProducts)
      .where(eq(fitoProducts.id, id));
    if (!existing) throw new NotFoundException('fito_product_not_found');
    if (existing.orgId === null) {
      throw new ForbiddenException('cannot_delete_global_product');
    }
    if (existing.orgId !== orgId) {
      throw new ForbiddenException('cannot_delete_other_org_product');
    }

    await this.db
      .update(fitoProducts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(fitoProducts.id, id));
    return { ok: true };
  }
}
