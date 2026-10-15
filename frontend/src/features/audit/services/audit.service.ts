import { api } from '@/shared/api/client';

export interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; name: string; email: string; role?: string } | null;
}

export interface AuditListResponse {
  data: AuditEntry[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export const auditService = {
  list: async (params: Record<string, any> = {}): Promise<AuditListResponse> => {
    const res = await api.get<AuditListResponse>('/audit', { params });
    return res.data;
  },
  actions: async (): Promise<string[]> => {
    const res = await api.get<{ data: string[] }>('/audit/actions');
    return res.data.data;
  },
};

export const ACTION_TINT: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-gray-100 text-gray-700',
  assign: 'bg-amber-100 text-amber-700',
  complete: 'bg-teal-100 text-teal-700',
  convert: 'bg-pink-100 text-pink-700',
};

export function tintFor(action: string): string {
  const verb = action.split('.').pop() ?? '';
  return ACTION_TINT[verb] ?? 'bg-gray-100 text-gray-700';
}
