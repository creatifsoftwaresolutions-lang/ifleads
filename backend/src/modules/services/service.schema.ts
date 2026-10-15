import { z } from 'zod';

export const AddServiceSchema = z.object({
  name: z.string().min(1).max(80),
});

export const RemoveServiceSchema = z.object({
  name: z.string().min(1),
});
