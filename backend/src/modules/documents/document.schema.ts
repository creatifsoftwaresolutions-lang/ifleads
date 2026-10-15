import { z } from 'zod';
export const ListDocumentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(30),
  category: z.string().optional(),
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  projectId: z.string().optional(),
  search: z.string().optional(),
});
export type ListDocumentsQuery = z.infer<typeof ListDocumentsQuerySchema>;
