'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Avatar,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
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
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Debounce search term để tránh gọi API quá nhiều khi user đang gõ
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Memoize params để tránh re-render không cần thiết
  const apiParams = useMemo(() => {
    const params: any = {
      page,
      limit: 6,
    };

    if (user?.id) {
      params.userId = user.id;
    }

    if (categoryFilter !== 'all') {
      params.category = categoryFilter;
    }

    if (debouncedSearchTerm.trim()) {
      params.search = debouncedSearchTerm.trim();
    }

    return params;
  }, [page, categoryFilter, debouncedSearchTerm, user?.id]);

  // Memoize function để tránh re-create function
  const fetchPostsData = useCallback(() => {
    dispatch(fetchPosts(apiParams));
  }, [dispatch, apiParams]);

  // Load initial data chỉ một lần
  useEffect(() => {
    if (!hasInitialLoad) {
      fetchPostsData();
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

  // Reset page về 1 khi filter thay đổi
  useEffect(() => {
    if (hasInitialLoad && page !== 1) {
      setPage(1);
    }
  }, [categoryFilter, debouncedSearchTerm, hasInitialLoad]);

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'technology', label: 'Technology' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'programming', label: 'Programming' },
  ];

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
  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle toggle save với optimistic update
  const handleToggleSave = useCallback((slug: string, currentSaved: boolean) => {
    if (!isAuthenticated) {
      // Có thể hiện modal login hoặc redirect
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tất cả bài viết
        </Typography>
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
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tất cả bài viết
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Khám phá các bài viết về lập trình và công nghệ
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
            helperText={searchTerm && searchTerm !== debouncedSearchTerm ? "Đang tìm kiếm..." : ""}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={categoryFilter}
              label="Danh mục"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.value} value={category.value}>
                  {category.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
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

        {/* Loading indicator for subsequent loads */}
        {loading && hasInitialLoad && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Đang tải...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Posts Grid */}
      <Grid container spacing={3}>
        {posts.map((post: Post) => {
          const isSaved = saveStatus[post.slug] || false;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  {post.featuredImage && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={post.featuredImage}
                      alt={post.title}
                    />
                  )}
                  
                  {/* Save button overlay */}
                  {isAuthenticated && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                      }}
                    >
                      <Tooltip title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleToggleSave(post.slug, isSaved);
                          }}
                          sx={{ 
                            color: isSaved ? 'primary.main' : 'white',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          {isSaved ? <Bookmark /> : <BookmarkBorder />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>

                <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none', flex: 1 }}>
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
                          {calculateReadingTime(post.content)} phút đọc
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{post.viewCount}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ThumbUp sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{post.likeCount}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Comment sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{post.commentCount}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Share sx={{ fontSize: 14 }} />
                          <Typography variant="caption">{post.shareCount}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {formatDate(post.publishedAt)}
                    </Typography>
                  </CardContent>
                </Link>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {posts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không có bài viết nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {debouncedSearchTerm ? `Không tìm thấy kết quả cho "${debouncedSearchTerm}"` : 'Hãy thử thay đổi bộ lọc'}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            disabled={loading}
          />
        </Box>
      )}
    </Container>
  );
} 