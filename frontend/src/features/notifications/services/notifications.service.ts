import { api } from '@/shared/api/client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: any;
  readAt: string | null;
  createdAt: string;
}

export interface ListResponse {
  data: Notification[];
  unreadCount: number;
}

export const notificationsService = {
  list: async (params: { unread?: boolean; limit?: number } = {}): Promise<ListResponse> => {
    const res = await api.get<ListResponse>('/notifications', { params });
    return res.data;
  },
  markRead: async (id: string): Promise<void> => {
    await api.post(`/notifications/${id}/read`);
  },
  markAllRead: async (): Promise<void> => {
    await api.post('/notifications/read-all');
  },
};
