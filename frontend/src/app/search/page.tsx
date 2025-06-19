'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search as SearchIcon,
  AccessTime,
  Visibility,
  ThumbUp,
  BookmarkBorder,
  Bookmark,
} from '@mui/icons-material';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchPosts, fetchBulkSaveStatus, optimisticToggleSave, togglePostSave } from '../../store/slices/postsSlice';
import { formatDate, calculateReadingTime } from '../../lib/utils';
import { getAllCategories } from '../../services/CategoryService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { posts, loading, error, pagination, saveStatus, saveLoading } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('date');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);

  // Debounce search query - chỉ gọi API sau 500ms kể từ lần gõ cuối
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);

  // Update search query when URL parameters change
  useEffect(() => {
    const queryFromUrl = searchParams?.get('q') || '';
    if (queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fetch posts when debounced search parameters change
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      const params: any = {
        page: pagination.currentPage,
        limit: 9, // Show more results on search page
        search: debouncedSearchQuery.trim(),
      };

      if (category !== 'all') {
        params.category = category;
      }

      // Sort by logic (the API doesn't support all these sort options, but we can simulate them)
      // For now, we'll use the default sorting from API which is by publishedAt DESC
      dispatch(fetchPosts(params));
    }
  }, [debouncedSearchQuery, pagination.currentPage, category, dispatch]);

  // Fetch save status for posts when user is authenticated
  useEffect(() => {
    if (isAuthenticated && posts.length > 0) {
      const slugs = posts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, isAuthenticated, posts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with new search query
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const params: any = {
      page: value,
      limit: 9,
      search: debouncedSearchQuery.trim(),
    };

    if (category !== 'all') {
      params.category = category;
    }

    dispatch(fetchPosts(params));
  };

  const handleSaveToggle = async (slug: string) => {
    if (!isAuthenticated) return;

    // Optimistic update
    dispatch(optimisticToggleSave({ 
      slug, 
      saved: !saveStatus[slug] 
    }));

    // Call API
    dispatch(togglePostSave(slug));
  };

  const sortOptions = [
    { value: 'date', label: 'Mới nhất' },
    { value: 'views', label: 'Lượt xem' },
    { value: 'likes', label: 'Lượt thích' },
    { value: 'relevance', label: 'Độ liên quan' },
  ];

  // Sort posts client-side since API doesn't support all sort options
  const sortedPosts = React.useMemo(() => {
    if (!posts || posts.length === 0) return [];
    
    const sorted = [...posts];
    switch (sortBy) {
      case 'views':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      case 'likes':
        return sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      case 'relevance':
        // For relevance, we could implement a more complex scoring system
        // For now, we'll sort by a combination of likes and views
        return sorted.sort((a, b) => {
          const scoreA = (a.likeCount || 0) * 2 + (a.viewCount || 0) * 0.1;
          const scoreB = (b.likeCount || 0) * 2 + (b.viewCount || 0) * 0.1;
          return scoreB - scoreA;
        });
      case 'date':
      default:
        return sorted.sort((a, b) => 
          new Date(b.publishedAt || b.createdAt).getTime() - 
          new Date(a.publishedAt || a.createdAt).getTime()
        );
    }
  }, [posts, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Tìm kiếm</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="pl-10 w-full"
            />
          </div>
          {/* Hiển thị indicator khi đang debounce */}
          {searchQuery !== debouncedSearchQuery && searchQuery.trim() && (
            <p className="text-sm text-gray-500 mt-2 ml-2">
              Đang tìm kiếm...
            </p>
          )}
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="min-w-[200px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[200px]">
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

        {/* Search Results Count */}
        {debouncedSearchQuery && !loading && (
          <p className="text-gray-600 mb-6">
            {pagination.totalItems > 0 
              ? `Tìm thấy ${pagination.totalItems} kết quả cho "${debouncedSearchQuery}"`
              : `Không tìm thấy kết quả nào cho "${debouncedSearchQuery}"`
            }
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
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
      )}

      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search Results */}
      {!loading && sortedPosts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col relative hover:shadow-lg transition-shadow">
                {/* Save Button */}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 bg-black/60 hover:bg-black/80"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveToggle(post.slug);
                    }}
                  >
                    {saveStatus[post.slug] ? (
                      <Bookmark className="h-4 w-4 text-white" />
                    ) : (
                      <BookmarkBorder className="h-4 w-4 text-white" />
                    )}
                  </Button>
                )}

                <Link href={`/posts/${post.slug}`} className="flex flex-col h-full text-decoration-none">
                  {post.featuredImage && (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div className="mb-3">
                      <Badge variant="secondary" className="mb-2">
                        {post.category?.name || ''}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center mb-3">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={post.author?.avatar || ''} alt={post.author?.name || ''} />
                        <AvatarFallback>{post.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-500">
                        {post.author?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <AccessTime className="h-3 w-3" />
                        <span>{post.readingTime || calculateReadingTime(post.content)} phút</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Visibility className="h-3 w-3" />
                          <span>{post.viewCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbUp className="h-3 w-3" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(post.publishedAt || post.createdAt)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange({} as any, page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && debouncedSearchQuery && sortedPosts.length === 0 && !error && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy kết quả
          </h3>
          <p className="text-gray-600">
            Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
          </p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !debouncedSearchQuery && (
        <div className="text-center py-16">
          <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nhập từ khóa để tìm kiếm
          </h3>
          <p className="text-gray-600">
            Tìm kiếm bài viết theo tiêu đề, nội dung hoặc thẻ
          </p>
        </div>
      )}
    </div>
  );
}