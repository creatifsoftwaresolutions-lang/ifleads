import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Response interceptor: handle 401 / 403 ───
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';

    // Don't loop on login/refresh failures
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/me');

    if (status === 401 && !isAuthCall) {
      try {
        await api.post('/auth/refresh');
        return api.request(error.config as InternalAxiosRequestConfig);
      } catch {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    if (status === 403) {
      // Let the caller decide — the AuthProvider marks 403 as unauthorized
      // and route-level RoleRoute already guards the UI.
    }

    return Promise.reject(error);
  }
);

export interface ApiError {
  error: string;
  message: string;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiError | undefined;
    return data?.message ?? err.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
