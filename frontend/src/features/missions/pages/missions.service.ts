import { api } from '@/shared/api/client';

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
  stats: {
    xp: number;
    streak: number;
    level: number;
    levelName: string;
    levelNextXp: number | null;
    levelPct: number;
    dailyGoal: number;
  };
  missions: Mission[];
  counts: {
    overdue: number;
    today: number;
    hot: number;
  };
}

export const missionsService = {
  today: async (): Promise<MissionsToday> => {
    const res = await api.get<MissionsToday>('/missions/today');
    return res.data;
  },
};
