import { api } from '@/shared/api/client';

export interface CalendarEvent {
  id: string;
  type: 'followup' | 'appointment';
  title: string;
  at: string;
  endAt?: string;
  status: string;
  relatedName: string | null;
  assignedTo: string | null;
  leadId?: string | null;
}

export const calendarService = {
  events: async (from: string, to: string) => {
    const res = await api.get<{ events: CalendarEvent[] }>('/calendar/events', {
      params: { from, to },
    });
    return res.data.events;
  },
};
