import { describe, expect, it } from 'vitest';
import { AskSchema } from './copilot.service.js';

const UUID = '00000000-0000-4000-8000-000000000001';

describe('AskSchema', () => {
  it('parses a minimal ask request', () => {
    const out = AskSchema.parse({ question: '¿Cuál es el umbral de mildiu?' });
    expect(out.question).toBeTruthy();
    expect(out.sessionId).toBeUndefined();
    expect(out.context).toBeUndefined();
  });

  it('parses with full context', () => {
    const out = AskSchema.parse({
      sessionId: UUID,
      question: '¿Qué aplicar en este lote?',
      context: { farmId: UUID, plotId: UUID, species: 'vitis vinifera' },
    });
    expect(out.context?.species).toBe('vitis vinifera');
    expect(out.sessionId).toBe(UUID);
  });

  it('rejects a question shorter than 2 chars', () => {
    expect(() => AskSchema.parse({ question: 'x' })).toThrow();
  });

  it('rejects a question longer than 4000 chars', () => {
    expect(() => AskSchema.parse({ question: 'x'.repeat(4001) })).toThrow();
  });

  it('rejects an invalid sessionId (not uuid)', () => {
    expect(() =>
      AskSchema.parse({ sessionId: 'not-a-uuid', question: '¿Algo?' }),
    ).toThrow();
  });

  it('allows sessionId to be omitted for a new session', () => {
    const out = AskSchema.parse({ question: 'Nueva sesión' });
    expect(out.sessionId).toBeUndefined();
  });
});
