import { describe, expect, it } from 'vitest';
import { LogOperationSchema, ListOperationsQuerySchema } from './field-log.service.js';

const UUID = '00000000-0000-4000-8000-000000000001';

describe('LogOperationSchema', () => {
  it('parses a minimal valid operation', () => {
    const out = LogOperationSchema.parse({
      plotId: UUID,
      operationTypeId: UUID,
      performedAt: new Date().toISOString(),
    });
    expect(out.plotId).toBe(UUID);
    expect(out.attachments).toEqual([]);
    expect(out.workerOutputs).toEqual([]);
    expect(out.metadata).toEqual({});
  });

  it('parses optional numeric fields', () => {
    const out = LogOperationSchema.parse({
      plotId: UUID,
      operationTypeId: UUID,
      performedAt: new Date().toISOString(),
      workersCount: 8,
      areaCoveredHa: 2.5,
      outputQuantity: 1200,
      outputUnit: 'kg',
      costAmount: 480000,
      costCurrency: 'COP',
    });
    expect(out.workersCount).toBe(8);
    expect(out.areaCoveredHa).toBe(2.5);
    expect(out.costCurrency).toBe('COP');
  });

  it('parses worker outputs', () => {
    const out = LogOperationSchema.parse({
      plotId: UUID,
      operationTypeId: UUID,
      performedAt: new Date().toISOString(),
      workerOutputs: [
        { workerId: UUID, hours: 6, units: 200, unit: 'cajas', amountPaid: 60000, currency: 'COP' },
      ],
    });
    expect(out.workerOutputs).toHaveLength(1);
    expect(out.workerOutputs[0].currency).toBe('COP');
  });

  it('rejects negative workersCount', () => {
    expect(() =>
      LogOperationSchema.parse({
        plotId: UUID,
        operationTypeId: UUID,
        performedAt: new Date().toISOString(),
        workersCount: -1,
      }),
    ).toThrow();
  });

  it('rejects invalid plotId UUID', () => {
    expect(() =>
      LogOperationSchema.parse({
        plotId: 'not-a-uuid',
        operationTypeId: UUID,
        performedAt: new Date().toISOString(),
      }),
    ).toThrow();
  });

  it('rejects costCurrency longer than 3 chars', () => {
    expect(() =>
      LogOperationSchema.parse({
        plotId: UUID,
        operationTypeId: UUID,
        performedAt: new Date().toISOString(),
        costCurrency: 'PESO',
      }),
    ).toThrow();
  });
});

describe('ListOperationsQuerySchema', () => {
  it('applies defaults', () => {
    const out = ListOperationsQuerySchema.parse({});
    expect(out.page).toBe(1);
    expect(out.pageSize).toBe(50);
  });

  it('filters by plotId', () => {
    const out = ListOperationsQuerySchema.parse({ plotId: UUID });
    expect(out.plotId).toBe(UUID);
  });

  it('rejects pageSize above 200', () => {
    expect(() => ListOperationsQuerySchema.parse({ pageSize: 201 })).toThrow();
  });

  it('rejects zero page', () => {
    expect(() => ListOperationsQuerySchema.parse({ page: 0 })).toThrow();
  });
});
