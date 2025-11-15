export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Content {
  id: number;
  title: string;
  slug: string;
  content?: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  author_id: number;
  author_name?: string;
  views: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresIn: string;
}

export interface DashboardStats {
  summary: {
    totalUsers: number;
    activeUsers: number;
    totalContent: number;
    publishedContent: number;
    totalViews: number;
    newUsers: number;
  };
  charts: {
    recentContent: Array<{ date: string; count: number }>;
    contentByStatus: Array<{ status: string; count: number }>;
    contentByCategory: Array<{ category: string; count: number }>;
  };
  topContent: Array<{
    id: number;
    title: string;
    views: number;
    category?: string;
  }>;
}

export interface Activity {
  id: number;
  action: string;
  resource_type?: string;
  resource_id?: number;
  created_at: string;
  username?: string;
  full_name?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
