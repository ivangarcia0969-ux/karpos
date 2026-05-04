import { z } from 'zod';

export const CopilotMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  orgId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  citations: z.array(z.unknown()),
  tokensIn: z.number().int().nullable().optional(),
  tokensOut: z.number().int().nullable().optional(),
  model: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type CopilotMessage = z.infer<typeof CopilotMessageSchema>;

export const CopilotAskResponseSchema = z.object({
  sessionId: z.string().uuid(),
  message: CopilotMessageSchema,
});
export type CopilotAskResponse = z.infer<typeof CopilotAskResponseSchema>;
