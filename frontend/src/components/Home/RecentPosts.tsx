'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateReadingTime, cn } from '../../lib/utils';
import { Post } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { toast } from 'react-toastify';
import { getRecentPost } from '../../services/PostService';
import { Button } from '../ui/button';
import { 
  Clock,
  Bookmark,
  BookmarkIcon,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const RecentPosts = () => {
  const dispatch = useAppDispatch();
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent posts
  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await getRecentPost(page, 5);
      setPosts(res.posts || []);
      setPagination(res.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 5,
      });
    } catch (err) {
      console.error('Error fetching recent posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recent posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Fetch save status cho các posts khi user đã login và posts đã load
  useEffect(() => {
    if (mounted && isAuthenticated && posts.length > 0) {
      const slugs = posts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, mounted, isAuthenticated, posts]);

  // Handle toggle save với optimistic update
  const handleToggleSave = (slug: string, currentSaved: boolean, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      toast.warn('Bạn cần đăng nhập để lưu bài viết.')
      return;
    }

    // Optimistic update
    dispatch(optimisticToggleSave({ slug, saved: !currentSaved }));
    
    // Thực hiện API call
    dispatch(togglePostSave(slug)).then((response: any) => {
      if (response.payload.message) {
        toast.success(response.payload.message);
      } else {
        toast.error(response.payload.message);
      }
    });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      fetchPosts(page);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const currentPage = pagination.currentPage;
      const totalPages = pagination.totalPages;
      
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse w-1/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse w-3/4" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        {posts.map((post) => {
          const isSaved = saveStatus[post.slug] || false;
          
          return (
            <div key={post.id} className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow group hover:scale-[101%] transition-transform duration-500">
              {/* Save button overlay */}
              {mounted && (
                <div className="absolute top-4 right-4 bg-black/60 rounded-lg z-10">
                  <button
                    onClick={(e) => handleToggleSave(post.slug, saveStatus[post.slug] || false, e)}
                    className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                    title={saveStatus[post.slug] ? 'Bỏ lưu' : 'Lưu bài viết'}
                  >
                    {saveStatus[post.slug] ? (
                      <Bookmark className="h-4 w-4 fill-current" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center">
                {/* Featured Image */}
                {post.featuredImage ? (
                  <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 relative overflow-hidden">
                    <Link href={`/posts/${post.slug}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full rounded-xl object-cover group-hover:scale-[102%] transition-transform duration-500"
                      />
                    </Link>
                  </div>
                ) : (
                  <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">No Image</span>
                  </div>
                )}

                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                      {post.category?.name || ''}
                    </span>
                  </div>
                  
                  <h2 className="text-md font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                    <Link href={`/posts/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${post.author?.id}`}>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                            {post.author?.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {post.author?.name?.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                              {post.author?.name}
                            </p>
                          </div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center gap-4 text-gray-500 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {calculateReadingTime(post.content)} phút đọc
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={pagination.currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className={cn(
                      "min-w-[2.5rem] dark:bg-gray-700 dark:hover:bg-gray-600",
                      pagination.currentPage === page && "bg-gray-900 hover:bg-gray-700 text-white dark:bg-black dark:hover:bg-gray-700"
                    )}
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="flex items-center gap-1"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentPosts; 