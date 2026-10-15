import { api } from '@/shared/api/client';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  owner: { id: string; name: string } | null;
  leadCount?: number;
  projectCount?: number;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  leads: { id: string; name: string; status: string; priority: string; createdAt: string; source: string | null }[];
  projects: { id: string; name: string; description: string | null; createdAt: string }[];
  documents: { id: string; name: string; url: string; mimeType: string | null; createdAt: string }[];
  activities: { id: string; type: string; title: string; body: string | null; createdAt: string; by?: { id: string; name: string } }[];
  appointments: { id: string; title: string; startAt: string; status: string }[];
}

export const customersService = {
  list: async (params: Record<string, any> = {}) => {
    const res = await api.get<{ data: Customer[]; meta: any }>('/customers', { params });
    return res.data;
  },
  get: async (id: string): Promise<CustomerDetail> => {
    const res = await api.get<{ data: CustomerDetail }>(`/customers/${id}`);
    return res.data.data;
  },
  create: async (input: any) => {
    const res = await api.post('/customers', input);
    return res.data.data as Customer;
  },
  update: async (id: string, input: any) => {
    const res = await api.patch(`/customers/${id}`, input);
    return res.data.data as Customer;
  },
  remove: async (id: string) => {
    await api.delete(`/customers/${id}`);
  },
  convertLead: async (leadId: string, input: any = {}) => {
    const res = await api.post(`/customers/convert-lead/${leadId}`, input);
    return res.data as { customer: Customer; linked: boolean };
  },
};
