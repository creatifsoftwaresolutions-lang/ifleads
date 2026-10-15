import { z } from 'zod';

export const CONFIG_TYPES = ['tag', 'lead_category', 'status', 'lead_source', 'dead_reason', 'service'] as const;

export const ListQuerySchema = z.object({
  type: z.enum(CONFIG_TYPES),
});

export const CreateSchema = z.object({
  type: z.enum(CONFIG_TYPES),
  name: z.string().min(1).max(80),
  color: z.string().max(20).optional(),
  order: z.coerce.number().optional(),
});

export const UpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  color: z.string().max(20).optional(),
  order: z.coerce.number().optional(),
});

export type CreateConfigInput = z.infer<typeof CreateSchema>;
export type UpdateConfigInput = z.infer<typeof UpdateSchema>;
