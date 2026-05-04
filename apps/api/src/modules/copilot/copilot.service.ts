import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { DRIZZLE, type Database } from '../../database/database.module.js';
import { TenancyService } from '../../tenancy/tenancy.service.js';
import { copilotMessages, copilotSessions } from '../../database/schema/copilot.js';
import type { Principal } from '../../iam/auth.service.js';
import { loadEnv } from '../../config/env.js';

export const AskSchema = z.object({
  sessionId: z.string().uuid().optional(),
  question: z.string().min(2).max(4000),
  context: z
    .object({
      farmId: z.string().uuid().optional(),
      plotId: z.string().uuid().optional(),
      species: z.string().optional(),
    })
    .optional(),
});
export type AskDto = z.infer<typeof AskSchema>;

@Injectable()
export class CopilotService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly tenancy: TenancyService,
  ) {}

  listSessions(principal: Principal) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      return tx
        .select()
        .from(copilotSessions)
        .where(eq(copilotSessions.userId, principal.userId))
        .orderBy(desc(copilotSessions.lastMessageAt));
    });
  }

  async ask(principal: Principal, dto: AskDto) {
    return this.tenancy.withTenant(principal.orgId, principal.userId, async (tx) => {
      let sessionId = dto.sessionId;
      if (!sessionId) {
        const [session] = await tx
          .insert(copilotSessions)
          .values({
            orgId: principal.orgId,
            userId: principal.userId,
            title: dto.question.slice(0, 80),
            context: dto.context ?? {},
          })
          .returning();
        sessionId = session.id;
      }

      await tx.insert(copilotMessages).values({
        sessionId,
        orgId: principal.orgId,
        role: 'user',
        content: dto.question,
      });

      const citations = await this.retrieveContext(tx, principal.orgId, dto.question);
      const answer = await this.callLlm(dto.question, citations, dto.context);

      const [stored] = await tx
        .insert(copilotMessages)
        .values({
          sessionId,
          orgId: principal.orgId,
          role: 'assistant',
          content: answer.content,
          citations: answer.citations,
          tokensIn: answer.tokensIn,
          tokensOut: answer.tokensOut,
          model: answer.model,
        })
        .returning();

      await tx
        .update(copilotSessions)
        .set({ lastMessageAt: new Date() })
        .where(eq(copilotSessions.id, sessionId));

      return { sessionId, message: stored };
    });
  }

  private async retrieveContext(
    tx: Database,
    orgId: string,
    question: string,
  ): Promise<Array<{ documentId: string; title: string; snippet: string; score: number }>> {
    // Embedding lookup is delegated to apps/ml; here we keep a stub that returns empty
    // when no embedding service is configured. Tenant + global corpus scoping enforced via RLS.
    const env = loadEnv();
    if (!env.ML_SERVICE_URL) return [];

    try {
      const res = await fetch(`${env.ML_SERVICE_URL}/embed`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${env.ML_API_KEY ?? ''}` },
        body: JSON.stringify({ text: question }),
      });
      if (!res.ok) return [];
      const { embedding } = (await res.json()) as { embedding: number[] };

      const rows = await tx.execute<{ document_id: string; title: string; snippet: string; score: number }>(sql`
        SELECT
          c.document_id,
          d.title,
          left(c.content, 400) AS snippet,
          1 - (c.embedding <=> ${JSON.stringify(embedding)}::vector) AS score
        FROM karpos.knowledge_chunks c
        JOIN karpos.knowledge_documents d ON d.id = c.document_id
        WHERE (c.org_id = ${orgId} OR c.org_id IS NULL)
        ORDER BY c.embedding <=> ${JSON.stringify(embedding)}::vector
        LIMIT 6
      `);
      return rows.map((r) => ({
        documentId: r.document_id,
        title: r.title,
        snippet: r.snippet,
        score: r.score,
      }));
    } catch {
      return [];
    }
  }

  private async callLlm(
    question: string,
    citations: Array<{ documentId: string; title: string; snippet: string; score: number }>,
    context: AskDto['context'],
  ): Promise<{ content: string; citations: unknown; tokensIn: number; tokensOut: number; model: string }> {
    const env = loadEnv();
    if (!env.ANTHROPIC_API_KEY && !env.OPENAI_API_KEY) {
      return {
        content:
          'El asistente Karpos IQ no está configurado en este entorno. Configura ANTHROPIC_API_KEY u OPENAI_API_KEY para activar respuestas. Pregunta: ' +
          question,
        citations,
        tokensIn: 0,
        tokensOut: 0,
        model: 'stub',
      };
    }
    // Real provider invocation lives in apps/ml when running in production; here we keep
    // a thin shim that emits a deterministic, citation-grounded answer.
    return {
      content: this.composeGroundedAnswer(question, citations, context),
      citations,
      tokensIn: question.length,
      tokensOut: 0,
      model: 'stub',
    };
  }

  private composeGroundedAnswer(
    question: string,
    citations: Array<{ title: string; snippet: string; score: number }>,
    context: AskDto['context'],
  ): string {
    const head = context?.species
      ? `Contexto: cultivo ${context.species}.`
      : 'Contexto agronómico general.';
    const refs = citations
      .map((c, i) => `[${i + 1}] ${c.title} — ${c.snippet}`)
      .join('\n');
    return `${head}\n\nPregunta: ${question}\n\nFuentes encontradas:\n${refs || '(sin fuentes en el corpus)'}\n\nResumen: la respuesta detallada se compone con LLM en producción.`;
  }
}
