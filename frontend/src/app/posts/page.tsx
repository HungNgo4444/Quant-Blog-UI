'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  Search,
  Comment,
  Share,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import Link from 'next/link';
import { calculateReadingTime, formatDate } from '../../lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchPosts, 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { Post } from '../../types';
import { toast } from 'react-toastify';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAllCategories } from 'frontend/src/services/CategoryService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { cn } from '../../lib/utils';

// Custom hook để debounce search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function PostsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading, error, pagination, saveStatus, saveLoading } = useSelector((state: RootState) => state.posts);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const params = useSearchParams();
  
  // Lấy các giá trị từ URL parameters
  const pageParam = params.get('page');
  const searchParam = params.get('search');
  const categoryParam = params.get('category');
  const sortParam = params.get('sort');
  
  const [page, setPage] = useState(pageParam ? parseInt(pageParam) : 1);
  const [searchTerm, setSearchTerm] = useState(searchParam || '');
  const [categoryFilter, setCategoryFilter] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState(sortParam || 'date');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [categories, setCategories] = useState([
    { value: 'all', label: 'Tất cả danh mục' },
  ]);

  // Debounce search term để tránh gọi API quá nhiều khi user đang gõ
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Function để cập nhật URL
  const updateURL = useCallback((newParams: any) => {
    const searchParams = new URLSearchParams();
    
    if (newParams.page && newParams.page !== 1) {
      searchParams.set('page', newParams.page.toString());
    }
    
    if (newParams.search) {
      searchParams.set('search', newParams.search);
    }
    
    if (newParams.category && newParams.category !== 'all') {
      searchParams.set('category', newParams.category);
    }
    
    if (newParams.sort && newParams.sort !== 'date') {
      searchParams.set('sort', newParams.sort);
    }
    
    const newURL = searchParams.toString() ? `/posts?${searchParams.toString()}` : '/posts';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Memoize params để tránh re-render không cần thiết
  const apiParams = useMemo(() => {
    const params: any = {
      page,
      limit: 6,
    };

    if (categoryFilter !== 'all') {
      params.category = categoryFilter;
    }

    if (sortBy) {
      params.sort = sortBy;
    }

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    return params;
  }, [page, categoryFilter, debouncedSearchTerm, user?.id, sortBy]);

  // Memoize function để tránh re-create function
  const fetchPostsData = useCallback(() => {
    dispatch(fetchPosts(apiParams));
  }, [dispatch, apiParams]);

  const fetchCategoryData = useCallback(async () => {
    try {
      const res = await getAllCategories();
      setCategories(categories.concat(res.map((category: any) => ({ value: category.slug, label: category.name }))));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    
  }, []);

  // Load initial data chỉ một lần
  useEffect(() => {
    if (!hasInitialLoad) {
      fetchPostsData();
      fetchCategoryData();
      setHasInitialLoad(true);
    }
  }, [fetchPostsData, hasInitialLoad]);

  // Chỉ gọi API khi params thay đổi và đã có initial load
  useEffect(() => {
    if (hasInitialLoad) {
      fetchPostsData();
    }
  }, [apiParams, hasInitialLoad, fetchPostsData]);

  // Fetch save status cho các posts khi user đã login và posts đã load
  useEffect(() => {
    if (isAuthenticated && posts.length > 0) {
      const slugs = posts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, isAuthenticated, posts]);

  // Cập nhật URL khi các params thay đổi
  useEffect(() => {
    if (hasInitialLoad) {
      updateURL({
        page,
        search: debouncedSearchTerm,
        category: categoryFilter,
        sort: sortBy
      });
    }
  }, [page, debouncedSearchTerm, categoryFilter, sortBy, hasInitialLoad, updateURL]);

  // Reset page về 1 khi filter thay đổi (trừ khi đang load initial)
  useEffect(() => {
    if (hasInitialLoad && page !== 1) {
      setPage(1);
    }
  }, [categoryFilter, debouncedSearchTerm, hasInitialLoad]);


  const sortOptions = [
    { value: 'date', label: 'Mới nhất' },
    { value: 'views', label: 'Xem nhiều nhất' },
    { value: 'likes', label: 'Thích nhiều nhất' },
  ];

  // Handle search với Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Search đã được handle bởi debounced value
    }
  }, []);

  // Handle page change
  const handlePageChange = useCallback((value: number) => {
    setPage(value);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle toggle save với optimistic update
  const handleToggleSave = useCallback((slug: string, currentSaved: boolean) => {
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

  }, [dispatch, isAuthenticated]);

  if (loading && !hasInitialLoad) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Tất cả bài viết</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tất cả bài viết</h1>
        <p className="text-xl text-gray-600 mb-6">
          Khám phá các bài viết về lập trình và công nghệ
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
            {searchTerm && searchTerm !== debouncedSearchTerm && (
              <p className="text-sm text-gray-500 mt-1">Đang tìm kiếm...</p>
            )}
          </div>

          <div className="min-w-[200px]">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[160px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading indicator for subsequent loads */}
        {loading && hasInitialLoad && (
          <div className="text-center mb-4">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => {
          const isSaved = saveStatus[post.slug] || false;
          
          return (
            <Card 
                key={post.id}
                className="group h-full flex flex-col transition-transform hover:shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700"
              >
              <div className="flex-1 flex flex-col">
                <div className="relative">
                  {post.featuredImage && (
                    <Link 
                      href={`/posts/${post.slug}`}
                      onClick={() => {
                        // Lưu current URL vào sessionStorage để có thể quay lại
                        sessionStorage.setItem('postsPageURL', window.location.href);
                      }}
                    >
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-40 object-cover rounded-t-lg group-hover:scale-[105%] transition-transform duration-300 cursor-pointer"
                      />
                    </Link>
                  )}
                  
                  {/* Save button overlay */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-lg p-2 hover:bg-white dark:hover:bg-gray-700"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleSave(post.slug, isSaved);
                    }}
                  >
                    {isSaved ? <Bookmark className="h-4 w-4 fill-current text-blue-600" /> : <BookmarkBorder className="h-4 w-4" />}
                  </Button>
                </div>

                
                  <CardContent className="h-72 flex-1 flex flex-col p-4">
                    <div className="mb-3">
                      <Badge 
                        variant="secondary" 
                        className="mb-2 text-xs font-medium text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 dark:text-gray-900 rounded-full px-2.5 py-1"
                      >
                        {post.category?.name || ''}
                      </Badge>
                    </div>
                    
                    <Link 
                      href={`/posts/${post.slug}`}
                      onClick={() => {
                        // Lưu current URL vào sessionStorage để có thể quay lại
                        sessionStorage.setItem('postsPageURL', window.location.href);
                      }}
                    >
                      <h3 className="text-base font-bold mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                        {post.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="mb-3">
                      <Link href={`/profile/${post.author?.id}`} className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={post.author?.avatar || ''} alt={post.author?.name || ''} />
                          <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                          {post.author?.name}
                        </span>
                      </Link>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <AccessTime className="h-3 w-3" />
                        <span>{calculateReadingTime(post.content)} phút đọc</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Visibility className="h-3 w-3" />
                          <span>{post.viewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbUp className="h-3 w-3" />
                          <span>{post.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Comment className="h-3 w-3" />
                          <span>{post.commentCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Share className="h-3 w-3" />
                          <span>{post.shareCount}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(post.publishedAt)}
                    </p>
                  </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có bài viết nào
          </h3>
          <p className="text-gray-600">
            {debouncedSearchTerm ? `Không tìm thấy kết quả cho "${debouncedSearchTerm}"` : 'Hãy thử thay đổi bộ lọc'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => (handlePageChange(pageNum))}
                disabled={loading}
                className={cn(
                  "min-w-[2.5rem] dark:bg-gray-700 dark:hover:bg-gray-600",
                  pageNum === page && "bg-gray-900 hover:bg-gray-700 text-white dark:bg-black dark:hover:bg-gray-700"
                )}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 