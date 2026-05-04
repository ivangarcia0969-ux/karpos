import { describe, expect, it } from 'vitest';
import { GddQuerySchema, RecordPhenologyEventSchema } from './phenology.service.js';

describe('phenology DTOs', () => {
  it('accepts a valid BBCH code', () => {
    const out = RecordPhenologyEventSchema.parse({
      plotId: '00000000-0000-4000-8000-000000000000',
      observedAt: new Date().toISOString(),
      bbchCode: '65',
      observedPct: 50,
    });
    expect(out.bbchCode).toBe('65');
  });

  it('rejects a bad BBCH code', () => {
    expect(() =>
      RecordPhenologyEventSchema.parse({
        plotId: '00000000-0000-4000-8000-000000000000',
        observedAt: new Date().toISOString(),
        bbchCode: 'BLOOM',
      }),
    ).toThrow();
  });

  it('coerces gdd query base temperature', () => {
    const out = GddQuerySchema.parse({
      plotId: '00000000-0000-4000-8000-000000000000',
      from: '2026-01-01',
      to: '2026-12-31',
      baseTempC: '8.5',
    });
    expect(out.baseTempC).toBe(8.5);
  });
});
