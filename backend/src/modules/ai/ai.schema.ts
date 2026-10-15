import { z } from 'zod';

export const ChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
});

export type ChatInput = z.infer<typeof ChatSchema>;
