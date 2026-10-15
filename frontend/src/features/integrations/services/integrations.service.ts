import { api } from '@/shared/api/client';

export interface MetaStatus {
  configured: boolean;
  appId: string | null;
  webhookUrl: string;
  verifyToken: string | null;
  metaLeadsCount: number;
  recentLeads: {
    id: string;
    name: string;
    source: string;
    createdAt: string;
  }[];
}

export const integrationsService = {
  metaStatus: async (): Promise<MetaStatus> => {
    const res = await api.get<{ data: MetaStatus }>('/meta/status');
    return res.data.data;
  },
};
