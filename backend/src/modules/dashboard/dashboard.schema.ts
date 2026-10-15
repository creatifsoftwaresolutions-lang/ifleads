import { z } from 'zod';

export const SummaryQuerySchema = z.object({
  range: z.enum(['today', 'week', 'month', 'all']).default('all'),
});

export type SummaryQuery = z.infer<typeof SummaryQuerySchema>;
