'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  TextField,
  InputAdornment,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tìm kiếm
        </Typography>
        
        {/* Search Form */}
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {/* Hiển thị indicator khi đang debounce */}
          {searchQuery !== debouncedSearchQuery && searchQuery.trim() && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              Đang tìm kiếm...
            </Typography>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={category}
              label="Danh mục"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">Tất cả danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              value={sortBy}
              label="Sắp xếp"
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Search Results Count */}
        {debouncedSearchQuery && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {pagination.totalItems > 0 
              ? `Tìm thấy ${pagination.totalItems} kết quả cho "${debouncedSearchQuery}"`
              : `Không tìm thấy kết quả nào cho "${debouncedSearchQuery}"`
            }
          </Typography>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={60} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {!loading && sortedPosts.length > 0 && (
        <>
          <Grid container spacing={3}>
            {sortedPosts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {/* Save Button */}
                  {isAuthenticated && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        zIndex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        minWidth: 'auto',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 1)',
                        }
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveToggle(post.slug);
                      }}
                    >
                      {saveStatus[post.slug] ? (
                        <Bookmark sx={{ fontSize: 20, color: 'primary.main' }} />
                      ) : (
                        <BookmarkBorder sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </Box>
                  )}

                  <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none', height: '100%' }}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {post.featuredImage && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={post.featuredImage}
                          alt={post.title}
                        />
                      )}
                      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={post.category?.name || ''}
                            size="small"
                            color="primary"
                            sx={{ mb: 1 }}
                          />
                        </Box>
                        
                        <Typography variant="h6" component="h3" gutterBottom>
                          {post.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2
                          }}
                        >
                          {post.excerpt}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar
                            src={post.author?.avatar || ''}
                            alt={post.author?.name || ''}
                            sx={{ width: 24, height: 24, mr: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {post.author?.name}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ fontSize: 14 }} />
                            <Typography variant="caption">
                              {post.readingTime || calculateReadingTime(post.content)} phút
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Visibility sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{post.viewCount || 0}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ThumbUp sx={{ fontSize: 14 }} />
                              <Typography variant="caption">{post.likeCount || 0}</Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          {formatDate(post.publishedAt || post.createdAt)}
                        </Typography>
                      </CardContent>
                    </Box>
                  </Link>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && debouncedSearchQuery && sortedPosts.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy kết quả
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !debouncedSearchQuery && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nhập từ khóa để tìm kiếm
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tìm kiếm bài viết theo tiêu đề, nội dung hoặc thẻ
          </Typography>
        </Box>
      )}
    </Container>
  );
} 