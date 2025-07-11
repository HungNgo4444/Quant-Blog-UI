'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Bookmark, 
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Archive,
  Share2,
  ChevronDown
} from 'lucide-react';
import { Post } from '../../types';
import { deletePost, toggleSavePost } from '../../services/PostService';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';

interface MyPostsTabsProps {
  myPosts: Post[];
  savedPosts: Post[];
  loading?: boolean;
  onPostDeleted?: (deletedSlug: string) => void;
  myPostsPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
  savedPostsPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
  onMyPostsPageChange?: (page: number) => void;
  onSavedPostsPageChange?: (page: number) => void;
}

export default function MyPostsTabs({ 
  myPosts, 
  savedPosts, 
  loading, 
  onPostDeleted,
  myPostsPagination,
  savedPostsPagination,
  onMyPostsPageChange,
  onSavedPostsPageChange
}: MyPostsTabsProps) {
  const [activeTab, setActiveTab] = useState<'my-posts' | 'saved'>('my-posts');

  const tabs = [
    {
      id: 'my-posts' as const,
      label: 'Bài viết của tôi',
      icon: FileText,
      count: myPosts.length,
      pagination: myPostsPagination
    },
    {
      id: 'saved' as const,
      label: 'Bài viết đã lưu',
      icon: Bookmark,
      count: savedPosts.length,
      pagination: savedPostsPagination
    }
  ];

  const currentPosts = activeTab === 'my-posts' ? myPosts : savedPosts;
  const currentPagination = activeTab === 'my-posts' ? myPostsPagination : savedPostsPagination;

  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-2.5 px-4 font-semibold text-sm transition-all rounded-lg flex-1 justify-center
                    ${isActive
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === 'my-posts' ? 'Của tôi' : 'Đã lưu'}
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
          
          {/* Pagination Info */}
          {currentPagination && currentPagination.totalItems > 0 && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Hiển thị {currentPosts.length} trong tổng số {currentPagination.totalItems} bài viết
              {currentPagination.totalPages > 1 && (
                <span className="ml-2">
                  (Trang {currentPagination.currentPage} / {currentPagination.totalPages})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <PostsLoading />
      ) : currentPosts.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <>
          <PostsList posts={currentPosts} showActions={activeTab === 'my-posts'} onPostDeleted={onPostDeleted} />
          <Pagination 
            activeTab={activeTab}
            myPostsPagination={myPostsPagination}
            savedPostsPagination={savedPostsPagination}
            onMyPostsPageChange={onMyPostsPageChange}
            onSavedPostsPageChange={onSavedPostsPageChange}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}

// Component hiển thị danh sách bài viết
interface PostsListProps {
  posts: Post[];
  showActions: boolean;
  onPostDeleted?: (deletedSlug: string) => void;
}

function PostsList({ posts, showActions, onPostDeleted }: PostsListProps) {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showActions={showActions} onPostDeleted={onPostDeleted} />
      ))}
    </div>
  );
}

// Component card cho từng bài viết
interface PostCardProps {
  post: Post;
  showActions: boolean;
  onPostDeleted?: (deletedSlug: string) => void;
}

function PostCard({ post, showActions, onPostDeleted }: PostCardProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Ẩn dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  const handleDelete = async (slug: string) => {
    try {
      await deletePost(slug);
      toast.success('Bài viết đã được xóa thành công');
      setShowDropdown(false);
      if (onPostDeleted) {
        onPostDeleted(slug);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa bài viết');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: {
        label: 'Đã xuất bản',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800'
      },
      draft: {
        label: 'Bản nháp',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex gap-6">
        <div onClick={() => router.push(`/posts/${post.slug}`)} className="cursor-pointer flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer line-clamp-2 transition-colors">
                {post.title}
              </h3>
            </div>
            {showActions && getStatusBadge(post.status)}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(post.publishedAt || '')}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.viewCount.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              <span>{post.likeCount.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{post.commentCount.toLocaleString()}</span>
            </div>

            {post.readingTime && (
              <span>{post.readingTime} phút đọc</span>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag: { id: string; name: string; slug: string }) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  #{tag.name}
                </span>
              ))}
              {post.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{post.tags.length - 3} thêm
                </span>
              )}
            </div>
          )}
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="flex-shrink-0">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-28 h-24 object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        {/* Actions Menu */}
        {showActions && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10" ref={dropdownRef}>
                <button onClick={() => router.push(`/posts/${post.slug}/edit`)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-full text-left transition-colors">
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={() => setOpenConfirmDelete(true)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog open={openConfirmDelete} onOpenChange={setOpenConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bài viết</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa bài viết này không?
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirmDelete(false)}>Hủy</Button>
            <Button variant="destructive" onClick={() => handleDelete(post.slug)}>Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component trạng thái trống
function EmptyState({ activeTab }: { activeTab: 'my-posts' | 'saved' }) {
  const config = {
    'my-posts': {
      icon: FileText,
      title: 'Chưa có bài viết nào',
      description: 'Bạn chưa viết bài viết nào. Hãy bắt đầu viết bài viết đầu tiên của bạn!',
      actionText: 'Viết bài viết mới',
      actionHref: '/posts/create'
    },
    'saved': {
      icon: Bookmark,
      title: 'Chưa có bài viết đã lưu',
      description: 'Bạn chưa lưu bài viết nào. Hãy khám phá và lưu những bài viết thú vị!',
      actionText: 'Khám phá bài viết',
      actionHref: '/posts'
    }
  };

  const { icon: Icon, title, description, actionText, actionHref } = config[activeTab];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        <a
          href={actionHref}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-sm font-semibold rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all shadow-lg hover:shadow-xl"
        >
          {actionText}
        </a>
      </div>
    </div>
  );
}

// Component loading
function PostsLoading() {
  return (
    <div className="space-y-8">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-4"></div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-14"></div>
                </div>
              </div>
              <div className="w-28 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Component Pagination
interface PaginationProps {
  activeTab: 'my-posts' | 'saved';
  myPostsPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
  savedPostsPagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasMore: boolean;
  };
  onMyPostsPageChange?: (page: number) => void;
  onSavedPostsPageChange?: (page: number) => void;
  loading?: boolean;
}

function Pagination({ 
  activeTab,
  myPostsPagination,
  savedPostsPagination,
  onMyPostsPageChange,
  onSavedPostsPageChange,
  loading
}: PaginationProps) {
  const config = {
    'my-posts': {
      pagination: myPostsPagination,
      onPageChange: onMyPostsPageChange
    },
    'saved': {
      pagination: savedPostsPagination,
      onPageChange: onSavedPostsPageChange
    }
  };

  const { pagination, onPageChange } = config[activeTab] || {};

  if (!pagination || !onPageChange || loading || pagination.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages } = pagination;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mt-8">
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border-2 ${
            currentPage === 1
              ? 'text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          Trước
        </button>

        {/* First page if not visible */}
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-all"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border-2 min-w-[2.75rem] ${
              page === currentPage
                ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white border-gray-900 dark:border-gray-600 shadow-lg'
                : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Last page if not visible */}
        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl transition-all"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all border-2 ${
            currentPage === totalPages
              ? 'text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          Tiếp
        </button>
      </div>
    </div>
  );
} 