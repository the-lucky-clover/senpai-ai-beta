const API_BASE = import.meta.env.VITE_API_URL || 'https://senpai-ai-worker.pounds1.workers.dev';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('senpai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (email: string, name?: string) =>
      fetchJson<{ token: string; userId: string; name: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      }),
    login: (email: string) =>
      fetchJson<{ token: string; userId: string; name: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  companions: {
    list: () => fetchJson<{ companions: any[] }>('/api/companions'),
    create: (data: any) =>
      fetchJson<{ id: string }>('/api/companions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJson<{ message: string }>(`/api/companions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJson<{ message: string }>(`/api/companions/${id}`, { method: 'DELETE' }),
    chats: {
      list: (id: string) => fetchJson<{ chats: any[] }>(`/api/companions/${id}/chats`),
      add: (id: string, role: string, content: string) =>
        fetchJson<{ id: string }>(`/api/companions/${id}/chats`, {
          method: 'POST',
          body: JSON.stringify({ role, content }),
        }),
    },
  },

  community: {
    list: (params?: { type?: string; limit?: number }) => {
      const qs = new URLSearchParams();
      if (params?.type) qs.set('type', params.type);
      if (params?.limit) qs.set('limit', String(params.limit));
      return fetchJson<{ items: any[] }>(`/api/community?${qs}`);
    },
    create: (data: any) =>
      fetchJson<{ id: string }>('/api/community', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    rate: (id: string, rating: number) =>
      fetchJson<{ message: string }>(`/api/community/${id}/rate`, {
        method: 'PUT',
        body: JSON.stringify({ rating }),
      }),
  },

  generate: {
    image: (data: { prompt: string; negativePrompt?: string; width?: number; height?: number; model?: string; seed?: number }) =>
      fetchJson<{ url: string }>('/api/generate/image', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  media: {
    upload: (file: File) => {
      const token = localStorage.getItem('senpai_token');
      const formData = new FormData();
      formData.append('file', file);
      return fetch(`${API_BASE}/api/media/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then(r => r.json());
    },
  },
};

export function setToken(token: string) {
  localStorage.setItem('senpai_token', token);
}

export function clearToken() {
  localStorage.removeItem('senpai_token');
}

export function getToken(): string | null {
  return localStorage.getItem('senpai_token');
}