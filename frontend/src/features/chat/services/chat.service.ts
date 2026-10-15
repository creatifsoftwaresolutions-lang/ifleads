import { api } from '@/shared/api/client';

export interface ChatUser {
  id: string;
  name: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  body: string;
  createdAt: string;
  sender: { id: string; name: string; role: string | null } | null;
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name: string;
  otherUser: { id: string; name: string; role: string | null } | null;
  members: { id: string; name: string; role: string | null }[];
  lastMessage: {
    body: string;
    at: string;
    senderId: string;
    senderName: string | null;
  } | null;
  updatedAt: string;
  unreadCount: number;
}

export const chatService = {
  listChats: async (): Promise<Chat[]> => {
    const res = await api.get<{ data: Chat[] }>('/chat');
    return res.data.data;
  },
  listUsers: async (): Promise<ChatUser[]> => {
    const res = await api.get<{ data: ChatUser[] }>('/chat/users');
    return res.data.data;
  },
  createDM: async (userId: string): Promise<Chat> => {
    const res = await api.post<{ data: Chat }>('/chat/dm', { userId });
    return res.data.data;
  },
  createGroup: async (name: string, memberIds: string[]): Promise<Chat> => {
    const res = await api.post<{ data: Chat }>('/chat/group', { name, memberIds });
    return res.data.data;
  },
  listMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const res = await api.get<{ data: ChatMessage[] }>(`/chat/${chatId}/messages`);
    return res.data.data;
  },
  sendMessage: async (chatId: string, body: string): Promise<ChatMessage> => {
    const res = await api.post<{ data: ChatMessage }>(`/chat/${chatId}/messages`, { body });
    return res.data.data;
  },
};
