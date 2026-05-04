import { uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { karpos } from './organizations.js';

export const knowledgeDocuments = karpos.table('knowledge_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id'),
  source: text('source').notNull(),
  sourceUrl: text('source_url'),
  title: text('title').notNull(),
  language: text('language').notNull().default('es'),
  topics: text('topics').array().notNull().default([]),
  speciesCodes: text('species_codes').array().notNull().default([]),
  citation: text('citation'),
  license: text('license'),
  ingestedAt: timestamp('ingested_at', { withTimezone: true }).notNull().defaultNow(),
});

export const copilotSessions = karpos.table('copilot_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  userId: uuid('user_id').notNull(),
  title: text('title'),
  context: jsonb('context').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
});

export const copilotMessages = karpos.table('copilot_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => copilotSessions.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'),
  citations: jsonb('citations').notNull().default([]),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  model: text('model'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CopilotSession = typeof copilotSessions.$inferSelect;
export type CopilotMessage = typeof copilotMessages.$inferSelect;
export type NewCopilotMessage = typeof copilotMessages.$inferInsert;
