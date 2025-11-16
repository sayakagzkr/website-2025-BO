import axios from 'axios';
import type { 
  LoginRequest, LoginResponse, User, Content, DashboardStats, Activity,
  Category, Product, Customer, Affiliate, Transaction, Invoice, Refund,
  DownloadLog, MailLog
} from '../types';

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

// Categories API
export const categoriesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ categories: Category[]; pagination: any }>('/categories', { params }),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// Products API
export const productsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category_id?: string; status?: string }) =>
    api.get<{ products: Product[]; pagination: any }>('/products', { params }),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

// Customers API
export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; country?: string }) =>
    api.get<{ customers: Customer[]; pagination: any }>('/customers', { params }),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

// Affiliates API
export const affiliatesApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ affiliates: Affiliate[]; pagination: any }>('/affiliates', { params }),
  create: (data: Partial<Affiliate>) => api.post<Affiliate>('/affiliates', data),
  update: (id: number, data: Partial<Affiliate>) => api.put<Affiliate>(`/affiliates/${id}`, data),
  delete: (id: number) => api.delete(`/affiliates/${id}`),
};

// Transactions API
export const transactionsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; country?: string }) =>
    api.get<{ transactions: Transaction[]; pagination: any }>('/transactions', { params }),
  getById: (id: number) => api.get<Transaction>(`/transactions/${id}`),
  create: (data: Partial<Transaction>) => api.post<Transaction>('/transactions', data),
  updateStatus: (id: number, status: string) => api.put<Transaction>(`/transactions/${id}`, { status }),
};

// Invoices API
export const invoicesApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ invoices: Invoice[]; pagination: any }>('/invoices', { params }),
  create: (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data),
  updateStatus: (id: number, status: string) => api.put<Invoice>(`/invoices/${id}`, { status }),
};

// Refunds API
export const refundsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<{ refunds: Refund[]; pagination: any }>('/refunds', { params }),
  create: (data: Partial<Refund>) => api.post<Refund>('/refunds', data),
  updateStatus: (id: number, status: string) => api.put<Refund>(`/refunds/${id}`, { status }),
};

// Logs API
export const logsApi = {
  getDownloadLogs: (params?: { page?: number; limit?: number }) =>
    api.get<{ logs: DownloadLog[]; pagination: any }>('/logs/downloads', { params }),
  logDownload: (data: { customer_id: number; product_id: number; transaction_id?: number; ip_address?: string }) =>
    api.post('/logs/downloads', data),
  getMailLogs: (params?: { page?: number; limit?: number }) =>
    api.get<{ logs: MailLog[]; pagination: any }>('/logs/mail', { params }),
  logMail: (data: { recipient: string; subject: string; body?: string; status?: string }) =>
    api.post('/logs/mail', data),
};

export default api;
