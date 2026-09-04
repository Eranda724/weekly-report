import { Report, ReportFormData } from '@/types/report';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export type Project = {
  id: string;
  name: string;
  isActive: boolean;
};

export const projectsApi = {
  list: (): Promise<Project[]> => apiFetch('/projects'),
  create: (name: string): Promise<Project> =>
    apiFetch('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: string, name: string): Promise<Project> =>
    apiFetch(`/projects/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  remove: (id: string): Promise<void> =>
    apiFetch(`/projects/${id}`, { method: 'DELETE' }),
};

export const reportsApi = {
  create: (data: ReportFormData): Promise<Report> =>
    apiFetch('/reports', { method: 'POST', body: JSON.stringify(data) }),

  getOne: (id: string): Promise<Report> => apiFetch(`/reports/${id}`),

  update: (id: string, data: ReportFormData): Promise<Report> =>
    apiFetch(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  submit: (id: string): Promise<Report> =>
    apiFetch(`/reports/${id}/submit`, { method: 'POST' }),

  listMine: (params?: { status?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiFetch(`/reports${qs ? `?${qs}` : ''}`) as Promise<{
      reports: Report[];
      total: number;
      page: number;
      pageSize: number;
    }>;
  },
};


//review and correction workflow
export const managerReportsApi = {
  listAll: (params?: {
    userId?: string;
    projectId?: string;
    status?: string;
    weekStartDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.status) query.set('status', params.status);
    if (params?.weekStartDate) query.set('weekStartDate', params.weekStartDate);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const qs = query.toString();
    return apiFetch(`/reports/team/all${qs ? `?${qs}` : ''}`) as Promise<{
      reports: Report[];
      total: number;
      page: number;
      pageSize: number;
    }>;
  },

  review: (id: string, decision: 'APPROVED' | 'NEEDS_CORRECTION', commentText?: string): Promise<Report> =>
    apiFetch(`/reports/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, commentText }),
    }),
};