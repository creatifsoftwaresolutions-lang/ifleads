import { api } from '@/shared/api/client';

export interface Appointment {
  id: string;
  title: string;
  description: string | null;
  startAt: string;
  endAt: string;
  status:
    | 'PENDING'
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'APPROVED'
    | 'DECLINED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';
  location: string | null;
  lead: { id: string; name: string; phone?: string | null } | null;
  customer: { id: string; name: string } | null;
  assignedTo: { id: string; name: string } | null;
  requestedBy?: { id: string; name: string } | null;
  forUser?: { id: string; name: string } | null;
  approver?: { id: string; name: string } | null;
  declineReason?: string | null;
  createdAt: string;
}

export interface AppointmentsListResponse {
  data: Appointment[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export interface AvailabilitySlot {
  hour: number;
  label: string;
  startAt: string;
  endAt: string;
  status: 'available' | 'booked' | 'blocked' | 'pending';
  meta: any;
}

export interface AvailabilityResponse {
  userId: string;
  date: string;
  slots: AvailabilitySlot[];
}

export interface BlockItem {
  id: string;
  userId: string;
  date: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  user?: { id: string; name: string };
}

export const appointmentsService = {
  list: async (params: Record<string, any> = {}): Promise<AppointmentsListResponse> => {
    const res = await api.get<AppointmentsListResponse>('/appointments', { params });
    return res.data;
  },

  getById: async (id: string): Promise<Appointment> => {
    const res = await api.get<{ data: Appointment }>(`/appointments/${id}`);
    return res.data.data;
  },

  availability: async (userId: string, date: string): Promise<AvailabilityResponse> => {
    const res = await api.get<{ data: AvailabilityResponse }>(
      '/appointments/availability',
      { params: { userId, date } }
    );
    return res.data.data;
  },

  create: async (input: any): Promise<Appointment> => {
    const res = await api.post<{ data: Appointment }>('/appointments', input);
    return res.data.data;
  },

  approve: async (id: string): Promise<Appointment> => {
    const res = await api.post<{ data: Appointment }>(`/appointments/${id}/approve`);
    return res.data.data;
  },

  decline: async (id: string, reason?: string): Promise<Appointment> => {
    const res = await api.post<{ data: Appointment }>(`/appointments/${id}/decline`, { reason });
    return res.data.data;
  },

  cancel: async (id: string): Promise<Appointment> => {
    const res = await api.post<{ data: Appointment }>(`/appointments/${id}/cancel`);
    return res.data.data;
  },

  blockSlot: async (input: {
    userId?: string;
    date: string;
    startHour: number;
    endHour: number;
    reason?: string;
  }): Promise<BlockItem> => {
    const res = await api.post<{ data: BlockItem }>('/appointments/block', input);
    return res.data.data;
  },

  unblock: async (id: string): Promise<void> => {
    await api.delete(`/appointments/block/${id}`);
  },

  blocks: async (from: string, to: string): Promise<BlockItem[]> => {
    const res = await api.get<{ data: BlockItem[] }>('/appointments/blocks', {
      params: { from, to },
    });
    return res.data.data;
  },
};
