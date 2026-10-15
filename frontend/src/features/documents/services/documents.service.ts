import { api } from '@/shared/api/client';

export interface Document {
  id: string;
  name: string;
  url: string;
  mimeType: string | null;
  size: number | null;
  category: string | null;
  customer: { id: string; name: string } | null;
  createdAt: string;
}

export interface ListResponse {
  data: Document[];
  meta: { page: number; pageSize: number; total: number; totalPages: number };
}

export const documentsService = {
  list: async (params: Record<string, any> = {}): Promise<ListResponse> => {
    const res = await api.get<ListResponse>('/documents', { params });
    return res.data;
  },
  upload: async (file: File, opts: { category?: string; customerId?: string; name?: string } = {}): Promise<Document> => {
    const form = new FormData();
    form.append('file', file);
    if (opts.category) form.append('category', opts.category);
    if (opts.customerId) form.append('customerId', opts.customerId);
    if (opts.name) form.append('name', opts.name);
    const res = await api.post<{ data: Document }>('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  remove: async (id: string) => { await api.delete(`/documents/${id}`); },
};

export function fmtBytes(n: number | null) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

export function iconFor(mime: string | null) {
  if (!mime) return '📄';
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.includes('pdf')) return '📕';
  if (mime.includes('word') || mime.includes('doc')) return '📘';
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return '📗';
  if (mime.includes('zip')) return '🗜️';
  return '📄';
}

export const CATEGORIES = [
  'general', 'quotation', 'contract', 'invoice',
  'requirement', 'design', 'report', 'deliverable',
];
