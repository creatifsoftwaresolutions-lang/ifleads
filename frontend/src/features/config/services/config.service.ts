import { api } from '@/shared/api/client';

export type ConfigType = 'tag' | 'lead_category' | 'status' | 'lead_source' | 'dead_reason' | 'service';

export interface ConfigItem {
  id: string;
  type: ConfigType;
  name: string;
  color: string | null;
  order: number;
  createdAt: string;
}

export const configService = {
  list: async (type: ConfigType): Promise<ConfigItem[]> => {
    const res = await api.get<{ data: ConfigItem[] }>('/config', { params: { type } });
    return res.data.data;
  },
  create: async (input: { type: ConfigType; name: string; color?: string; order?: number }): Promise<ConfigItem> => {
    const res = await api.post<{ data: ConfigItem }>('/config', input);
    return res.data.data;
  },
  update: async (id: string, input: { name?: string; color?: string; order?: number }): Promise<ConfigItem> => {
    const res = await api.patch<{ data: ConfigItem }>(`/config/${id}`, input);
    return res.data.data;
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/config/${id}`);
  },
};

export const CONFIG_TABS: { id: ConfigType; label: string; hasColor: boolean; addLabel: string }[] = [
  { id: 'lead_category', label: 'Lead category', hasColor: false, addLabel: 'Add Category' },
  { id: 'tag',           label: 'Tag',           hasColor: true,  addLabel: 'Add Tag' },
  { id: 'status',        label: 'Status',        hasColor: false, addLabel: 'Add Status' },
  { id: 'lead_source',   label: 'Lead Source',   hasColor: false, addLabel: 'Add Source' },
  { id: 'dead_reason',   label: 'Dead Reason',   hasColor: false, addLabel: 'Add Reason' },
  { id: 'service',       label: 'Service',       hasColor: false, addLabel: 'Add Service' },
];

export const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
  '#6b7280', // gray
  '#0f172a', // slate
];
