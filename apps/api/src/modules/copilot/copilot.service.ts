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

interface Citation {
  documentId: string;
  title: string;
  snippet: string;
  score: number;
}

interface LlmResult {
  content: string;
  citations: unknown;
  tokensIn: number;
  tokensOut: number;
  model: string;
}

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

  private async retrieveContext(tx: Database, orgId: string, question: string): Promise<Citation[]> {
    const env = loadEnv();
    if (!env.ML_SERVICE_URL) return [];

    try {
      const res = await fetch(`${env.ML_SERVICE_URL}/embed`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${env.ML_API_KEY ?? ''}`,
        },
        body: JSON.stringify({ text: question }),
        signal: AbortSignal.timeout(5_000),
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

  private async callLlm(question: string, citations: Citation[], context: AskDto['context']): Promise<LlmResult> {
    const env = loadEnv();

    if (env.ANTHROPIC_API_KEY) {
      return this.callAnthropic(question, citations, context, env.ANTHROPIC_API_KEY);
    }

    if (env.OPENAI_API_KEY) {
      return this.callOpenAi(question, citations, context, env.OPENAI_API_KEY);
    }

    return this.stubAnswer(question, citations, context);
  }

  private async callAnthropic(
    question: string,
    citations: Citation[],
    context: AskDto['context'],
    apiKey: string,
  ): Promise<LlmResult> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userMessage = this.buildUserMessage(question, citations);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
      usage: { input_tokens: number; output_tokens: number };
      model: string;
    };

    const text = data.content.find((b) => b.type === 'text')?.text ?? '';
    return {
      content: text,
      citations,
      tokensIn: data.usage.input_tokens,
      tokensOut: data.usage.output_tokens,
      model: data.model,
    };
  }

  private async callOpenAi(
    question: string,
    citations: Citation[],
    context: AskDto['context'],
    apiKey: string,
  ): Promise<LlmResult> {
    const systemPrompt = this.buildSystemPrompt(context);
    const userMessage = this.buildUserMessage(question, citations);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 1024,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`OpenAI API error ${res.status}`);

    const data = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage: { prompt_tokens: number; completion_tokens: number };
      model: string;
    };

    return {
      content: data.choices[0]?.message.content ?? '',
      citations,
      tokensIn: data.usage.prompt_tokens,
      tokensOut: data.usage.completion_tokens,
      model: data.model,
    };
  }

  private buildSystemPrompt(context: AskDto['context']): string {
    const cropLine = context?.species ? `El cultivo principal es ${context.species}. ` : '';
    return `Eres Karpos IQ, un asistente agronómico experto para productores latinoamericanos de frutales. ${cropLine}Respondes de forma precisa, práctica y en español. Cuando tienes fuentes técnicas, las citas con números entre corchetes [1], [2], etc. Eres concreto y das recomendaciones accionables basadas en evidencia. No inventas datos ni protocolos que no existan.`;
  }

  private buildUserMessage(question: string, citations: Citation[]): string {
    if (citations.length === 0) return question;

    const sources = citations
      .map((c, i) => `[${i + 1}] ${c.title}:\n${c.snippet}`)
      .join('\n\n');

    return `Pregunta del productor: ${question}\n\nFuentes técnicas disponibles:\n${sources}\n\nResponde usando las fuentes cuando corresponda.`;
  }

  private stubAnswer(question: string, citations: Citation[], context: AskDto['context']): LlmResult {
    const head = context?.species ? `Contexto: cultivo ${context.species}.` : 'Contexto agronómico general.';
    const refs = citations.map((c, i) => `[${i + 1}] ${c.title} — ${c.snippet}`).join('\n');
    return {
      content: `${head}\n\nPregunta: ${question}\n\nFuentes encontradas:\n${refs || '(sin fuentes en el corpus)'}\n\nPara respuestas con IA, configura ANTHROPIC_API_KEY en el servidor.`,
      citations,
      tokensIn: 0,
      tokensOut: 0,
      model: 'stub',
    };
  }
}
