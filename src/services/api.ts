const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      return handleResponse<T>(retryResponse);
    } else {
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

// ==================== AUTH API ====================
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
    tribunal?: string;
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

  verifyToken: async () => {
    return apiRequest<any>('/auth/verify');
  },
};

// ==================== USER API ====================
export const userAPI = {
  getMe: () => apiRequest<any>('/users/me'),
  
  updateMe: (data: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    adresse?: string;
    avatarUrl?: string;
  }) => apiRequest<any>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getUserById: (id: string) => apiRequest<any>(`/users/${id}`),

  changePassword: (currentPassword: string, newPassword: string) => 
    apiRequest<any>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  // Gestion des utilisateurs (Admin/Greffier)
  list: (params?: { role?: string; status?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.role && params.role !== '__all__') queryParams.append('role', params.role);
    if (params?.status && params.status !== '__all__') queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return apiRequest<any>(`/users${query ? `?${query}` : ''}`);
  },

  create: (data: {
    email: string;
    password?: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
    tribunal?: string;
  }) => apiRequest<any>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/users/${id}`, {
    method: 'DELETE',
  }),

  // Activation/Désactivation de compte
  activate: (id: string) => apiRequest<any>(`/users/${id}/activate`, {
    method: 'POST',
  }),

  deactivate: (id: string) => apiRequest<any>(`/users/${id}/deactivate`, {
    method: 'POST',
  }),
};

// ==================== DOSSIER API ====================
export const dossierAPI = {
  list: (params?: { page?: number; limit?: number; statut?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.statut) queryParams.append('statut', params.statut);
    if (params?.type) queryParams.append('type', params.type);
    const query = queryParams.toString();
    return apiRequest<any>(`/dossiers${query ? `?${query}` : ''}`);
  },

  create: (data: {
    numeroDossier: string;
    titre: string;
    description?: string;
    type: string;
    tribunal: string;
    chambre?: string;
    jugeId?: string;
    procureurId?: string;
    justiciableId: string;
    avocatIds?: string[];
    montantLitige?: number;
    observations?: string;
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
    observations?: string;
  }) => apiRequest<any>(`/dossiers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/dossiers/${id}`, {
    method: 'DELETE',
  }),

  getHistorique: (id: string) => apiRequest<any>(`/dossiers/${id}/historique`),

  addPiece: (id: string, data: {
    nom: string;
    description?: string;
    typeFichier: string;
    tailleFichier: number;
    urlFichier: string;
    confidentiel?: boolean;
  }) => apiRequest<any>(`/dossiers/${id}/pieces`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getPieces: (id: string) => apiRequest<any>(`/dossiers/${id}/pieces`),
};

// ==================== AUDIENCE API ====================
export const audienceAPI = {
  listPublic: () => apiRequest<any>('/audiences/public'),

  list: (params?: { page?: number; limit?: number; date?: string; salle?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.date) queryParams.append('date', params.date);
    if (params?.salle) queryParams.append('salle', params.salle);
    const query = queryParams.toString();
    return apiRequest<any>(`/audiences${query ? `?${query}` : ''}`);
  },

  create: (data: {
    dossierId: string;
    dateAudience: string;
    heureDebut: string;
    heureFin?: string;
    salle: string;
    typeAudience: string;
    objetAudience: string;
    observations?: string;
    publicationWeb?: boolean;
  }) => apiRequest<any>('/audiences', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getById: (id: string) => apiRequest<any>(`/audiences/${id}`),

  getByUuid: (uuid: string) => apiRequest<any>(`/audiences/public/${uuid}`),

  update: (id: string, data: any) => apiRequest<any>(`/audiences/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  reporter: (id: string, data: { nouvelleDate: string; nouvelHeure: string; motif: string }) => 
    apiRequest<any>(`/audiences/${id}/reporter`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  annuler: (id: string, motif: string) => apiRequest<any>(`/audiences/${id}/annuler`, {
    method: 'PUT',
    body: JSON.stringify({ motif }),
  }),

  cancel: (id: string) => apiRequest<any>(`/audiences/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== DECISION API ====================
export const decisionAPI = {
  list: (params?: { page?: number; limit?: number; statut?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.statut) queryParams.append('statut', params.statut);
    const query = queryParams.toString();
    return apiRequest<any>(`/decisions${query ? `?${query}` : ''}`);
  },

  create: (data: {
    dossierId: string;
    numeroDecision: string;
    typeDecision: string;
    dateDelibere: string;
    dispositif: string;
    motivationComplete?: string;
    sensPrononce?: string;
  }) => apiRequest<any>('/decisions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getById: (id: string) => apiRequest<any>(`/decisions/${id}`),

  update: (id: string, data: {
    dispositif?: string;
    motivationComplete?: string;
    sensPrononce?: string;
  }) => apiRequest<any>(`/decisions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Soumettre pour validation (Juge)
  submitForValidation: (id: string) => 
    apiRequest<any>(`/decisions/${id}/submit`, { method: 'PUT' }),

  // Valider la décision (Greffier)
  validate: (id: string, commentaire?: string) => 
    apiRequest<any>(`/decisions/${id}/validate`, {
      method: 'PUT',
      body: JSON.stringify({ commentaire }),
    }),

  // Rejeter la décision (Greffier)
  reject: (id: string, motif: string) => 
    apiRequest<any>(`/decisions/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ motif }),
    }),

  // Publier la décision (Greffier)
  publish: (id: string) => 
    apiRequest<any>(`/decisions/${id}/publish`, { method: 'PUT' }),

  // Historique des décisions
  getHistory: (params?: { dossierId?: string; jugeId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.dossierId) queryParams.append('dossierId', params.dossierId);
    if (params?.jugeId) queryParams.append('jugeId', params.jugeId);
    const query = queryParams.toString();
    return apiRequest<any>(`/decisions/history${query ? `?${query}` : ''}`);
  },
};

// ==================== INSTRUCTION API ====================
export const instructionAPI = {
  list: (params?: { page?: number; limit?: number; statut?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.statut) queryParams.append('statut', params.statut);
    const query = queryParams.toString();
    return apiRequest<any>(`/instructions${query ? `?${query}` : ''}`);
  },

  create: (data: {
    type: string;
    titre: string;
    description: string;
    priorite?: string;
    dossierId?: string;
    audienceId?: string;
    dateEcheance?: string;
  }) => apiRequest<any>('/instructions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getById: (id: string) => apiRequest<any>(`/instructions/${id}`),

  // Prendre en charge (Greffier)
  takeCharge: (id: string) => 
    apiRequest<any>(`/instructions/${id}/take-charge`, { method: 'PUT' }),

  // Marquer comme traitée (Greffier)
  complete: (id: string, commentaire: string) => 
    apiRequest<any>(`/instructions/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ commentaire }),
    }),

  // Annuler (Juge)
  cancel: (id: string) => 
    apiRequest<any>(`/instructions/${id}/cancel`, { method: 'PUT' }),
};

// ==================== SALLE API ====================
export const salleAPI = {
  list: () => apiRequest<any>('/salles'),

  getDisponibles: () => apiRequest<any>('/salles/disponibles'),

  getById: (id: string) => apiRequest<any>(`/salles/${id}`),

  create: (data: {
    nom: string;
    capacite?: number;
    equipements?: string[];
    etage?: string;
    batiment?: string;
  }) => apiRequest<any>('/salles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: {
    nom?: string;
    capacite?: number;
    equipements?: string[];
    disponible?: boolean;
    etage?: string;
    batiment?: string;
  }) => apiRequest<any>(`/salles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/salles/${id}`, {
    method: 'DELETE',
  }),

  checkDisponibilite: (data: {
    salleNom: string;
    date: string;
    heureDebut: string;
    heureFin?: string;
    excludeAudienceId?: string;
  }) => apiRequest<any>('/salles/check-disponibilite', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  list: (params?: { page?: number; limit?: number; type?: string; lu?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.lu !== undefined) queryParams.append('lu', params.lu.toString());
    const query = queryParams.toString();
    return apiRequest<any>(`/notifications${query ? `?${query}` : ''}`);
  },

  markAsRead: (id: string) => apiRequest<any>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),

  markAllAsRead: () => apiRequest<any>('/notifications/read-all', {
    method: 'PUT',
  }),

  getUnreadCount: () => apiRequest<any>('/notifications/unread-count'),

  getPreferences: () => apiRequest<any>('/notifications/preferences'),

  updatePreferences: (data: any) => apiRequest<any>('/notifications/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Envoyer notification manuelle (Greffier)
  send: (data: {
    userId: string;
    type: string;
    titre: string;
    message: string;
    canal: string;
    dossierId?: string;
    audienceId?: string;
  }) => apiRequest<any>('/notifications/send', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Envoyer notification en masse
  sendBulk: (data: {
    userIds: string[];
    type: string;
    titre: string;
    message: string;
    canal: string;
  }) => apiRequest<any>('/notifications/send-bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// ==================== BLOG API ====================
export const blogAPI = {
  list: (params?: { page?: number; limit?: number; publie?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.publie !== undefined) queryParams.append('publie', params.publie.toString());
    const query = queryParams.toString();
    return apiRequest<any>(`/blog${query ? `?${query}` : ''}`);
  },

  getBySlug: (slug: string) => apiRequest<any>(`/blog/${slug}`),

  create: (data: {
    titre: string;
    slug: string;
    contenu: string;
    resume?: string;
    imageUrl?: string;
    publie?: boolean;
    tags?: string[];
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

  publish: (id: string) => apiRequest<any>(`/blog/${id}/publish`, {
    method: 'PUT',
  }),
};

// ==================== DOCUMENT API ====================
export const documentAPI = {
  listPublic: () => apiRequest<any>('/documents/public'),

  getById: (id: string) => apiRequest<any>(`/documents/${id}`),

  upload: (data: {
    titre: string;
    description?: string;
    categorie: string;
    typeFichier: string;
    urlFichier: string;
    tailleFichier: number;
    tags?: string[];
    publie?: boolean;
  }) => apiRequest<any>('/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: any) => apiRequest<any>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => apiRequest<any>(`/documents/${id}`, {
    method: 'DELETE',
  }),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  // Utilisateurs
  listUsers: (params?: { page?: number; limit?: number; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    const query = queryParams.toString();
    return apiRequest<any>(`/admin/users${query ? `?${query}` : ''}`);
  },

  getUserById: (id: string) => apiRequest<any>(`/admin/users/${id}`),

  createUser: (data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    role: string;
  }) => apiRequest<any>('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateUser: (id: string, data: any) => apiRequest<any>(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteUser: (id: string) => apiRequest<any>(`/admin/users/${id}`, {
    method: 'DELETE',
  }),

  changeUserRole: (id: string, role: string) => apiRequest<any>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),

  toggleUserStatus: (id: string) => apiRequest<any>(`/admin/users/${id}/toggle-status`, {
    method: 'PUT',
  }),

  // Statistiques
  getStats: () => apiRequest<any>('/admin/stats'),

  getStatsByPeriod: (startDate: string, endDate: string) => 
    apiRequest<any>(`/admin/stats/period?start=${startDate}&end=${endDate}`),

  getMonthlyEvolution: () => apiRequest<any>('/admin/stats/monthly'),

  getJugePerformance: () => apiRequest<any>('/admin/stats/juge-performance'),

  getPostponementAnalysis: () => apiRequest<any>('/admin/stats/postponements'),

  // Audit
  getAuditLogs: (params?: { page?: number; limit?: number; action?: string; userId?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);
    const query = queryParams.toString();
    return apiRequest<any>(`/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  getSuspiciousActivity: () => apiRequest<any>('/admin/audit-logs/suspicious'),

  // Paramètres système
  getSystemSettings: () => apiRequest<any>('/admin/settings'),

  updateSystemSettings: (data: any) => apiRequest<any>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// ==================== AI API ====================
export const aiAPI = {
  chat: (message: string, context?: any) => apiRequest<any>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  }),

  suggest: (type: string, context?: any) => apiRequest<any>('/ai/suggest', {
    method: 'POST',
    body: JSON.stringify({ type, context }),
  }),

  analyzeDocument: (documentId: string) => apiRequest<any>('/ai/analyze-document', {
    method: 'POST',
    body: JSON.stringify({ documentId }),
  }),

  predictPostponement: (audienceId: string) => apiRequest<any>('/ai/predict-postponement', {
    method: 'POST',
    body: JSON.stringify({ audienceId }),
  }),
};

// ==================== STATS API ====================
export const statsAPI = {
  getGlobal: () => apiRequest<any>('/admin/stats'),
  getMonthly: () => apiRequest<any>('/admin/stats/monthly'),
  getJugePerformance: () => apiRequest<any>('/admin/stats/juge-performance'),
  getPostponements: () => apiRequest<any>('/admin/stats/postponements'),
  getDossiersByType: () => apiRequest<any>('/admin/stats/dossiers-by-type'),
  getTodayAudiences: () => apiRequest<any>('/admin/stats/today-audiences'),
};
