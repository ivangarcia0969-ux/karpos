import { describe, expect, it } from 'vitest';
import { CreateFarmSchema, ListFarmsQuerySchema, UpdateFarmSchema } from './farms.dto.js';

const BASE_UUID = '00000000-0000-4000-8000-000000000001';

describe('CreateFarmSchema', () => {
  it('parses a minimal valid farm', () => {
    const out = CreateFarmSchema.parse({
      code: 'FCA-001',
      name: 'El Rosal',
      countryCode: 'co',
      timezone: 'America/Bogota',
    });
    expect(out.countryCode).toBe('CO');
    expect(out.contact).toEqual({});
    expect(out.metadata).toEqual({});
  });

  it('accepts optional fields', () => {
    const out = CreateFarmSchema.parse({
      code: 'FCA-002',
      name: 'Andes Sur',
      countryCode: 'AR',
      timezone: 'America/Argentina/Buenos_Aires',
      region: 'Mendoza',
      locality: 'Luján de Cuyo',
      elevationM: 900,
      totalAreaHa: 45.5,
      centroid: { lat: -33.04, lng: -68.98 },
    });
    expect(out.totalAreaHa).toBe(45.5);
    expect(out.centroid?.lat).toBeCloseTo(-33.04);
  });

  it('rejects a code longer than 40 chars', () => {
    expect(() =>
      CreateFarmSchema.parse({
        code: 'X'.repeat(41),
        name: 'X',
        countryCode: 'CL',
        timezone: 'America/Santiago',
      }),
    ).toThrow();
  });

  it('rejects negative totalAreaHa', () => {
    expect(() =>
      CreateFarmSchema.parse({
        code: 'F01',
        name: 'F',
        countryCode: 'PE',
        timezone: 'America/Lima',
        totalAreaHa: -5,
      }),
    ).toThrow();
  });

  it('rejects a country code longer than 2 chars', () => {
    expect(() =>
      CreateFarmSchema.parse({
        code: 'F01',
        name: 'F',
        countryCode: 'COL',
        timezone: 'America/Bogota',
      }),
    ).toThrow();
  });
});

describe('UpdateFarmSchema', () => {
  it('allows partial updates', () => {
    const out = UpdateFarmSchema.parse({ name: 'Nuevo nombre' });
    expect(out.name).toBe('Nuevo nombre');
    expect(out.code).toBeUndefined();
  });

  it('still validates nested fields', () => {
    expect(() => UpdateFarmSchema.parse({ totalAreaHa: -1 })).toThrow();
  });
});

describe('ListFarmsQuerySchema', () => {
  it('uses defaults for page and pageSize', () => {
    const out = ListFarmsQuerySchema.parse({});
    expect(out.page).toBe(1);
    expect(out.pageSize).toBe(50);
  });

  it('coerces string numbers', () => {
    const out = ListFarmsQuerySchema.parse({ page: '3', pageSize: '25' });
    expect(out.page).toBe(3);
    expect(out.pageSize).toBe(25);
  });

  it('rejects pageSize > 200', () => {
    expect(() => ListFarmsQuerySchema.parse({ pageSize: '201' })).toThrow();
  });

  it('passes optional search query', () => {
    const out = ListFarmsQuerySchema.parse({ q: 'rosal' });
    expect(out.q).toBe('rosal');
  });
});
