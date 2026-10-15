import { api } from '@/shared/api/client';

export interface ReportsOverview {
  funnel: Record<string, number>;
  sources: { source: string; count: number }[];
  priorities: { priority: string; count: number }[];
  leadTrend: { date: string; count: number }[];
  topPerformers: { userId: string; name: string; role: string; xp: number; leadCount: number }[];
  followups: { pending: number; completed: number; completionPct: number };
  tasks: Record<string, number>;
  summary: { totalLeads: number; conversionPct: number; won: number; lost: number };
}

export const reportsService = {
  overview: async (params: { from?: string; to?: string; userId?: string } = {}): Promise<ReportsOverview> => {
    const res = await api.get<ReportsOverview>('/reports/overview', { params });
    return res.data;
  },
};

export const FUNNEL_COLORS: Record<string, string> = {
  NEW: '#3b82f6',
  CONTACTED: '#6366f1',
  QUALIFIED: '#8b5cf6',
  PROPOSAL: '#a855f7',
  NEGOTIATION: '#f59e0b',
  WON: '#10b981',
  LOST: '#ef4444',
};

export const SOURCE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#fbbf24',
  HIGH: '#f97316',
  HOT: '#ef4444',
};

export const TASK_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  DONE: '#10b981',
  CANCELLED: '#ef4444',
};
