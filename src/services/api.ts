const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenManager.getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expiré, essayer de rafraîchir
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Réessayer la requête avec le nouveau token
      headers['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return handleResponse<T>(retryResponse);
    } else {
      // Impossible de rafraîchir, déconnecter
      tokenManager.clearTokens();
      window.location.href = '/auth';
      throw new Error('Session expirée');
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Une erreur est survenue');
  }

  return data;
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setTokens(data.data.accessToken, data.data.refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
  }) => {
    return apiRequest<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.data?.accessToken) {
      tokenManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
    }
    return response;
  },

  logout: async () => {
    await apiRequest('/auth/logout', { method: 'POST' });
    tokenManager.clearTokens();
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, password: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// User API
export const userAPI = {
  getMe: () => apiRequest<any>('/users/me'),
  
  updateMe: (data: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    adresse?: string;
  }) => apiRequest<any>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getUserById: (id: string) => apiRequest<any>(`/users/${id}`),
};

// Dossier API
export const dossierAPI = {
  list: () => apiRequest<any>('/dossiers'),

  create: (data: {
    numeroDossier: string;
    titre: string;
    description?: string;
    type: string;
    jugeId?: string;
    avocatId?: string;
    justiciableId?: string;
  }) => apiRequest<any>('/dossiers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getById: (id: string) => apiRequest<any>(`/dossiers/${id}`),

  update: (id: string, data: {
    titre?: string;
    description?: string;
    statut?: string;
    type?: string;
  }) => apiRequest<any>(`/dossiers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/dossiers/${id}`, {
    method: 'DELETE',
  }),
};

// Audience API
export const audienceAPI = {
  listPublic: () => apiRequest<any>('/audiences/public'),

  list: () => apiRequest<any>('/audiences'),

  create: (data: {
    dossierId: string;
    dateAudience: string;
    heureDebut: string;
    heureFin?: string;
    salle: string;
    type: string;
    estPublique?: boolean;
  }) => apiRequest<any>('/audiences', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getById: (id: string) => apiRequest<any>(`/audiences/${id}`),

  update: (id: string, data: any) => apiRequest<any>(`/audiences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  cancel: (id: string) => apiRequest<any>(`/audiences/${id}`, {
    method: 'DELETE',
  }),
};

// Notification API
export const notificationAPI = {
  list: () => apiRequest<any>('/notifications'),

  markAsRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),

  getPreferences: () => apiRequest<any>('/notifications/preferences'),

  updatePreferences: (data: any) => apiRequest<any>('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// Blog API
export const blogAPI = {
  list: () => apiRequest<any>('/blog'),

  getBySlug: (slug: string) => apiRequest<any>(`/blog/${slug}`),

  create: (data: {
    titre: string;
    slug: string;
    contenu: string;
    extrait?: string;
    imageUrl?: string;
    publie?: boolean;
  }) => apiRequest<any>('/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: any) => apiRequest<any>(`/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/blog/${id}`, {
    method: 'DELETE',
  }),
};

// Document API
export const documentAPI = {
  listPublic: () => apiRequest<any>('/documents/public'),

  getById: (id: string) => apiRequest<any>(`/documents/${id}`),

  upload: (data: {
    titre: string;
    description?: string;
    type: string;
    url: string;
    ordre?: number;
  }) => apiRequest<any>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Admin API
export const adminAPI = {
  listUsers: () => apiRequest<any>('/admin/users'),

  changeUserRole: (id: string, role: string) => apiRequest<any>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),

  getStats: () => apiRequest<any>('/admin/stats'),

  getAuditLogs: () => apiRequest<any>('/admin/audit-logs'),
};

// AI API
export const aiAPI = {
  chat: (message: string, context?: any) => apiRequest<any>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  }),

  suggest: (type: string, context?: any) => apiRequest<any>('/ai/suggest', {
    method: 'POST',
    body: JSON.stringify({ type, context }),
  }),
};
