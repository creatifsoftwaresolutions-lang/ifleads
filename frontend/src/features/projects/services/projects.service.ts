import { api } from '@/shared/api/client';

export type ProjectStatus = 'NEW'|'PLANNING'|'IN_PROGRESS'|'WAITING_FOR_CUSTOMER'|'REVIEW'|'COMPLETED'|'CANCELLED';
export type ProjectPriority = 'LOW'|'MEDIUM'|'HIGH'|'URGENT';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  targetDate: string | null;
  completedAt: string | null;
  customer: { id: string; name: string } | null;
  createdAt: string;
}

export const projectsService = {
  list: async (params: Record<string, any> = {}) => {
    const res = await api.get<{ data: Project[]; meta: any }>('/projects', { params });
    return res.data;
  },
  create: async (input: any) => {
    const res = await api.post('/projects', input);
    return res.data.data as Project;
  },
  update: async (id: string, input: any) => {
    const res = await api.patch(`/projects/${id}`, input);
    return res.data.data as Project;
  },
  remove: async (id: string) => { await api.delete(`/projects/${id}`); },
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  NEW: 'New',
  PLANNING: 'Planning',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_CUSTOMER: 'Waiting for Customer',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const STATUS_COLOR: Record<ProjectStatus, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  WAITING_FOR_CUSTOMER: 'bg-amber-100 text-amber-700',
  REVIEW: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLOR: Record<ProjectPriority, string> = {
  LOW: 'bg-gray-100 text-gray-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700',
};

export const ALL_STATUSES: ProjectStatus[] = [
  'NEW','PLANNING','IN_PROGRESS','WAITING_FOR_CUSTOMER','REVIEW','COMPLETED','CANCELLED',
];
