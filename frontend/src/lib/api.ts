import { Report, ReportFormData } from '@/types/report';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

export type ProjectMember = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
};

export type Project = {
  id: string;
  name: string;
  isActive: boolean;
  projectMembers?: ProjectMember[];
};

export type Category = {
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
  addMember: (projectId: string, userId: string): Promise<any> =>
    apiFetch(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ userId }) }),
  removeMember: (projectId: string, userId: string): Promise<void> =>
    apiFetch(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  list: (): Promise<Category[]> => apiFetch('/categories'),
  create: (name: string): Promise<Category> =>
    apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  update: (id: string, name: string): Promise<Category> =>
    apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
  remove: (id: string): Promise<void> =>
    apiFetch(`/categories/${id}`, { method: 'DELETE' }),
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
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.userId) query.set('userId', params.userId);
    if (params?.projectId) query.set('projectId', params.projectId);
    if (params?.status) query.set('status', params.status);
    if (params?.weekStartDate) query.set('weekStartDate', params.weekStartDate);
    if (params?.fromDate) query.set('fromDate', params.fromDate);
    if (params?.toDate) query.set('toDate', params.toDate);
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

//team dashboard
export type BasicUser = { id: string; name: string; email: string };

export type TeamUser = BasicUser & {
  role: 'TEAM_MEMBER';
  isActive: boolean;
};

export const usersApi = {
  list: (): Promise<TeamUser[]> => apiFetch('/users'),
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'TEAM_MEMBER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  createdAt?: string;
};

export const usersAdminApi = {
  listAll: (): Promise<AdminUser[]> => apiFetch('/users/admin/all'),
  create: (data: { name: string; email: string; password: string; role: string }): Promise<AdminUser> =>
    apiFetch('/users/admin/create', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id: string, role: string): Promise<AdminUser> =>
    apiFetch(`/users/admin/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deactivate: (id: string): Promise<AdminUser> =>
    apiFetch(`/users/admin/${id}/deactivate`, { method: 'PUT' }),
  reactivate: (id: string): Promise<AdminUser> =>
    apiFetch(`/users/admin/${id}/reactivate`, { method: 'PUT' }),
};

//charts
export type DashboardMetrics = {
  summary: {
    weekStartDate: string;
    totalSubmittedThisWeek: number;
    complianceRate: { submitted: number; pending: number; late: number };
    newReportsCount: number;
    needsCorrectionCount: number;
    acceptedReportsCount: number;
    draftReportsCount: number;
    openBlockersCount: number;
  };
  trend: { weekStartDate: string; completedTasks: number }[];
  statusByMember: { userId: string; name: string; statuses: { week: string; status: string }[] }[];
  workloadByProject: { project: string; taskCount: number }[];
  timeByTaskType: { taskCategory: string; hours: number }[];
  activityFeed: { type: string; timestamp: string; text: string; reportId: string }[];
};

export const dashboardApi = {
  getMetrics: (weekStartDate?: string): Promise<DashboardMetrics> =>
    apiFetch(`/dashboard/metrics${weekStartDate ? `?weekStartDate=${weekStartDate}` : ''}`),
};

export const aiApi = {
  chat: (question: string): Promise<{ answer: string }> =>
    apiFetch('/ai/chat', { method: 'POST', body: JSON.stringify({ question }) }),
  getSummary: (weekStartDate?: string): Promise<{ summary: string }> =>
    apiFetch(`/ai/summary${weekStartDate ? `?weekStartDate=${weekStartDate}` : ''}`),
};