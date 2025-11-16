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

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category_id?: number;
  category_name?: string;
  image_url?: string;
  stock: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  email: string;
  full_name: string;
  country?: string;
  address?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: number;
  user_id?: number;
  username?: string;
  email?: string;
  code: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  customer_id: number;
  customer_email?: string;
  customer_name?: string;
  affiliate_id?: number;
  affiliate_code?: string;
  product_id: number;
  product_name?: string;
  amount: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  card_bin?: string;
  country?: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  transaction_id?: number;
  customer_id: number;
  customer_email?: string;
  customer_name?: string;
  amount: number;
  status: 'unpaid' | 'paid' | 'cancelled';
  due_date?: string;
  paid_at?: string;
  created_at: string;
}

export interface Refund {
  id: number;
  transaction_id: number;
  trans_id?: string;
  customer_email?: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'processed' | 'rejected';
  processed_at?: string;
  created_at: string;
}

export interface DownloadLog {
  id: number;
  customer_id: number;
  customer_email?: string;
  customer_name?: string;
  product_id: number;
  product_name?: string;
  transaction_id?: number;
  transaction_id_str?: string;
  ip_address?: string;
  created_at: string;
}

export interface MailLog {
  id: number;
  recipient: string;
  subject: string;
  body?: string;
  status: 'sent' | 'failed' | 'pending';
  sent_at: string;
}
