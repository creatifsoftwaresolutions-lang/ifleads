import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  location: z.string().max(200).optional(),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
  // If omitted → booked for self
  forUserId: z.string().optional(),
});

export const ListAppointmentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(50),
  status: z
    .enum([
      'PENDING',
      'SCHEDULED',
      'CONFIRMED',
      'APPROVED',
      'DECLINED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ])
    .optional(),
  view: z.enum(['all', 'mine', 'forMe', 'requests', 'today', 'overdue']).default('all'),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const AvailabilityQuerySchema = z.object({
  userId: z.string().min(1),
  date: z.string().min(10), // YYYY-MM-DD
});

export const BlockSchema = z.object({
  userId: z.string().optional(), // defaults to self
  date: z.string().min(10),      // YYYY-MM-DD
  startHour: z.coerce.number().min(0).max(23),
  endHour: z.coerce.number().min(1).max(24),
  reason: z.string().max(200).optional(),
});

export const DeclineSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type ListAppointmentsQuery = z.infer<typeof ListAppointmentsQuerySchema>;
export type AvailabilityQuery = z.infer<typeof AvailabilityQuerySchema>;
export type BlockInput = z.infer<typeof BlockSchema>;
