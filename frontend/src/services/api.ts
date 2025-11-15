import axios from 'axios';
import type { LoginRequest, LoginResponse, User, Content, DashboardStats, Activity } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest) => api.post<LoginResponse>('/auth/login', data),
  getCurrentUser: () => api.get<User>('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Users API
export const usersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) =>
    api.get<{ users: User[]; pagination: any }>('/users', { params }),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Content API
export const contentApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }) =>
    api.get<{ content: Content[]; pagination: any }>('/content', { params }),
  getById: (id: number) => api.get<Content>(`/content/${id}`),
  create: (data: Partial<Content>) => api.post<Content>('/content', data),
  update: (id: number, data: Partial<Content>) => api.put<Content>(`/content/${id}`, data),
  delete: (id: number) => api.delete(`/content/${id}`),
};

// Analytics API
export const analyticsApi = {
  getDashboard: () => api.get<DashboardStats>('/analytics/dashboard'),
  getActivity: (params?: { limit?: number }) => api.get<Activity[]>('/analytics/activity', { params }),
  logActivity: (data: { action: string; resource_type?: string; resource_id?: number }) =>
    api.post('/analytics/activity', data),
};

export default api;
