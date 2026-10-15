import { api } from '@/shared/api/client';

export interface Template {
  id: string;
  name: string;
  body: string;
  category: string;
  createdAt: string;
}

export interface WaLog {
  id: string;
  type: string;
  title: string;
  body: string | null;
  method: string;
  lead: { id: string; name: string; phone: string | null } | null;
  customer: { id: string; name: string; phone: string | null } | null;
  actor: { id: string; name: string } | null;
  createdAt: string;
}

export const whatsappService = {
  listTemplates: async (): Promise<Template[]> => {
    const res = await api.get<{ data: Template[] }>('/whatsapp/templates');
    return res.data.data;
  },
  createTemplate: async (input: { name: string; body: string; category?: string }): Promise<Template> => {
    const res = await api.post<{ data: Template }>('/whatsapp/templates', input);
    return res.data.data;
  },
  updateTemplate: async (id: string, input: Partial<Template>): Promise<Template> => {
    const res = await api.patch<{ data: Template }>('/whatsapp/templates/' + id, input);
    return res.data.data;
  },
  deleteTemplate: async (id: string): Promise<void> => {
    await api.delete('/whatsapp/templates/' + id);
  },
  send: async (input: { phone: string; message: string; leadId?: string; customerId?: string; templateId?: string }): Promise<{ waLink: string }> => {
    const res = await api.post<{ waLink: string }>('/whatsapp/send', { ...input, method: 'click-to-chat' });
    return res.data;
  },
  listLogs: async (params: Record<string, any> = {}) => {
    const res = await api.get<{ data: WaLog[]; meta: any }>('/whatsapp/logs', { params });
    return res.data;
  },
};

export const WA_CATEGORIES = ['general', 'greeting', 'follow-up', 'quotation', 'reminder', 'thankyou'];
