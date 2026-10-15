import { api } from '@/shared/api/client';

export interface AIReply {
  intent: string;
  reply: string;
  data?: any;
  links?: { label: string; href: string }[];
}

export const aiService = {
  chat: async (message: string): Promise<AIReply> => {
    const res = await api.post<AIReply>('/ai/chat', { message });
    return res.data;
  },
};

export const SUGGESTIONS = [
  'How many leads do I have?',
  'Show me hot leads',
  "What are today's follow-ups?",
  'Show overdue follow-ups',
  'What are my tasks?',
  'Appointments today',
  'Who is the top performer?',
  'What is my XP?',
  'Recent activity',
  'How many customers?',
];
