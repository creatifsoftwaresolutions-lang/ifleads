import { z } from 'zod';

export const CreateDMSchema = z.object({
  userId: z.string().min(1),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(2).max(80),
  memberIds: z.array(z.string()).min(1).max(50),
});

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const ListMessagesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(100),
});

export type CreateDMInput = z.infer<typeof CreateDMSchema>;
export type CreateGroupInput = z.infer<typeof CreateGroupSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof ListMessagesQuerySchema>;
