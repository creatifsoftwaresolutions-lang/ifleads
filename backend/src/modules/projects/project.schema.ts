import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(5000).optional(),
  customerId: z.string().optional(),
  status: z.enum(['NEW','PLANNING','IN_PROGRESS','WAITING_FOR_CUSTOMER','REVIEW','COMPLETED','CANCELLED']).optional(),
  priority: z.enum(['LOW','MEDIUM','HIGH','URGENT']).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ListProjectsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['NEW','PLANNING','IN_PROGRESS','WAITING_FOR_CUSTOMER','REVIEW','COMPLETED','CANCELLED']).optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;
