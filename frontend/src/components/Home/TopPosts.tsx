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
import { getTopPosts } from '../../services/PostService';
import { Button } from '../ui/button';
import { 
  Clock,
  Bookmark,
  BookmarkIcon,
  Calendar,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageCircle,
  User,
  Award
} from 'lucide-react';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

const TopPosts = () => {
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

  // Fetch top posts (posts with highest likes)
  const fetchTopPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await getTopPosts(page, 5, 'likes');
      setPosts(res.posts || []);
      setPagination(res.pagination || {
        currentPage: page,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 5,
      });
    } catch (err) {
      console.error('Error fetching top posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch top posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopPosts(1);
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
      fetchTopPosts(page);
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
      <div className="space-y-8">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-80 h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 p-8">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse w-1/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse w-3/4" />
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse w-1/2" />
              </div>
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
    <div className="space-y-8">
      <div className="space-y-8">
        {posts.map((post, index) => {
          const isSaved = saveStatus[post.slug] || false;
          
          return (
            <div key={post.id} className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
              {/* Ranking badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
                  <Award className="w-3 h-3" />
                  <span className="text-xs font-bold">#{index + 1}</span>
                </div>
              </div>

              {/* Save button overlay */}
              {mounted && (
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleToggleSave(post.slug, saveStatus[post.slug] || false, e)}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white p-2 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                    title={saveStatus[post.slug] ? 'Bỏ lưu' : 'Lưu bài viết'}
                  >
                    {saveStatus[post.slug] ? (
                      <Bookmark className="h-4 w-4 fill-current text-blue-600" />
                    ) : (
                      <BookmarkIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row">
                {/* Featured Image */}
                {post.featuredImage ? (
                  <div className="w-full sm:w-64 h-40 sm:h-48 relative overflow-hidden">
                    <Link href={`/posts/${post.slug}`}>
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="w-full sm:w-64 h-40 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                      <span className="text-gray-500 text-xs font-medium">No Image</span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 dark:text-gray-900 rounded-full">
                        {post.category?.name || ''}
                      </span>
                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-xs font-bold">
                          {post.likeCount || 0} likes
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-lg font-bold mb-3 hover:text-gray-600 dark:hover:text-gray-300 transition-colors line-clamp-2">
                      <Link href={`/posts/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed line-clamp-2 text-sm">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Link href={`/profile/${post.author?.id}`}>
                        <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 p-0.5 shadow-lg">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                              {post.author?.avatar ? (
                                <img
                                  src={post.author.avatar}
                                  alt={post.author.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {post.author?.name?.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                              {post.author?.name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </Link>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>{post.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <Clock className="w-3 h-3" />
                          <span>{calculateReadingTime(post.content)} phút</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.commentCount || 0}</span>
                        </div>
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
        <div className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          {/* Previous button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="flex items-center gap-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </Button>

          {/* Page numbers */}
          <div className="flex items-center space-x-2 mx-6">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={pagination.currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page as number)}
                    className={cn(
                      "min-w-[2.5rem] border-2",
                      pagination.currentPage === page 
                        ? "bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg hover:from-gray-800 hover:to-gray-600" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
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
            className="flex items-center gap-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TopPosts; 