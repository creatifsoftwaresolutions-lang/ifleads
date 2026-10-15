import { z } from 'zod';

export const SendMessageSchema = z.object({
  phone: z.string().min(6).max(20),
  message: z.string().min(1).max(5000),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
  templateId: z.string().optional(),
  // 'click-to-chat' = user opened wa.me, we record it but can't confirm delivery
  // 'api' = future WhatsApp Business API (needs credentials)
  method: z.enum(['click-to-chat', 'api']).default('click-to-chat'),
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(2).max(80),
  body: z.string().min(2).max(2000),
  category: z.string().max(40).optional(),
});

export const UpdateTemplateSchema = CreateTemplateSchema.partial();

export const ListLogsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(30),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
export type ListLogsQuery = z.infer<typeof ListLogsQuerySchema>;
