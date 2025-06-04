export interface DashboardStats {
  posts: {
    total: number;
    views: number;
  };
  users: {
    total: number;
    authors: number;
  };
  categories: {
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    cached?: boolean;
  };
} 