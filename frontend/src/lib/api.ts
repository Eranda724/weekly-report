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
