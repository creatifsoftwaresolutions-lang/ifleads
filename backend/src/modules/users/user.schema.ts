import { z } from 'zod';
import { RoleName, UserStatus } from '@prisma/client';

export const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
  role: z.nativeEnum(RoleName),
  teamId: z.string().optional(),
  managerId: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.nativeEnum(RoleName).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});
