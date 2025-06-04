export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  bio?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: 'published' | 'draft';
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  allowComments: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  categoryId: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: User;
  parentId?: string;
  approved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
  };
  analyticsCode?: string;
  updatedAt: Date;
}

export interface Analytics {
  totalViews: number;
  totalPosts: number;
  totalUsers: number;
  totalComments: number;
  popularPosts: Post[];
  recentActivity: ActivityLog[];
  viewsThisMonth: number;
  growthRate: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  user: User;
  details: Record<string, any>;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface ThemeState {
  mode: 'light' | 'dark';
}

export interface NotificationState {
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  featured_image?: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
}

export interface TagFormData {
  name: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

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