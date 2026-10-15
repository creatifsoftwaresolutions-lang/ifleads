import { api } from '@/shared/api/client';

export interface MissionsStats {
  xp: number;
  streak: number;
  level: number;
  levelName: string;
  levelNextXp: number | null;
  levelPct: number;
  dailyGoal: number;
  doneToday: number;
}

export interface Mission {
  id: string;
  name: string;
  phone: string | null;
  priority: string;
  status: string;
  kind: 'overdue' | 'today' | 'hot';
  nextFollowupAt: string | null;
  nextAction: string;
}

export interface MissionsToday {
  stats: MissionsStats;
  missions: Mission[];
  counts: { overdue: number; today: number; hot: number };
}

export interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  role: string;
  teamName: string | null;
  isMe: boolean;
}

export interface XpHistoryRow {
  id: string;
  reason: string;
  amount: number;
  createdAt: string;
}

export const missionsService = {
  today: async (): Promise<MissionsToday> => {
    const res = await api.get<MissionsToday>('/missions/today');
    return res.data;
  },
  stats: async (): Promise<MissionsStats> => {
    const res = await api.get<MissionsStats>('/missions/stats');
    return res.data;
  },
  leaderboard: async (): Promise<LeaderboardRow[]> => {
    const res = await api.get<{ data: LeaderboardRow[] }>('/missions/leaderboard');
    return res.data.data;
  },
  history: async (): Promise<XpHistoryRow[]> => {
    const res = await api.get<{ data: XpHistoryRow[] }>('/missions/history');
    return res.data.data;
  },
};

export const XP_LABELS: Record<string, string> = {
  'followup.complete': 'Completed follow-up',
  'contact.phone': 'Phone contact',
  'lead.interested': 'Lead interested',
  'quotation.sent': 'Quotation sent',
  'meeting.scheduled': 'Meeting scheduled',
  'meeting.completed': 'Meeting completed',
  'lead.convert': 'Lead converted',
};
