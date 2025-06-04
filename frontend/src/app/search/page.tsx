'use client';

import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDate, calculateReadingTime } from '../../lib/utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  publishedAt: string;
  views: number;
  likes: number;
  category: {
    name: string;
    slug: string;
  };
  tags: Array<{
    name: string;
    slug: string;
  }>;
  author: {
    name: string;
    avatar?: string;
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    }
  }, [searchQuery, page, sortBy, category]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Simulated search - replace with actual API call
      const mockResults: Post[] = [
        {
          id: '1',
          title: 'Getting Started with TypeScript in 2024',
          slug: 'getting-started-with-typescript-2024',
          excerpt: 'Learn the fundamentals of TypeScript and how to integrate it into your development workflow.',
          content: 'TypeScript has become an essential tool for modern web development...',
          featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
          publishedAt: '2024-01-15T10:00:00Z',
          views: 1234,
          likes: 89,
          category: { name: 'Technology', slug: 'technology' },
          tags: [
            { name: 'TypeScript', slug: 'typescript' },
            { name: 'Programming', slug: 'programming' }
          ],
          author: {
            name: 'Admin User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '2',
          title: 'Building Modern React Applications with Next.js',
          slug: 'building-modern-react-applications-nextjs',
          excerpt: 'Discover how to build scalable React applications using Next.js framework with TypeScript.',
          content: 'Next.js is a powerful React framework that provides everything you need...',
          featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
          publishedAt: '2024-01-14T09:00:00Z',
          views: 987,
          likes: 67,
          category: { name: 'Tutorial', slug: 'tutorial' },
          tags: [
            { name: 'React', slug: 'react' },
            { name: 'Next.js', slug: 'nextjs' },
            { name: 'TypeScript', slug: 'typescript' }
          ],
          author: {
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        }
      ];

      // Filter based on search query
      const filteredResults = mockResults.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setPosts(filteredResults);
      setTotalPages(Math.ceil(filteredResults.length / 10));
      setLoading(false);
    } catch (err) {
      setError('Có lỗi xảy ra khi tìm kiếm');
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    performSearch();
  };

  const categories = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'technology', label: 'Technology' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'programming', label: 'Programming' },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Độ liên quan' },
    { value: 'date', label: 'Ngày đăng' },
    { value: 'views', label: 'Lượt xem' },
    { value: 'likes', label: 'Lượt thích' },
  ];

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
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
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
        {searchQuery && !loading && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {posts.length > 0 
              ? `Tìm thấy ${posts.length} kết quả cho "${searchQuery}"`
              : `Không tìm thấy kết quả nào cho "${searchQuery}"`
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
      {!loading && posts.length > 0 && (
        <>
          <Grid container spacing={3}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Link href={`/posts/${post.slug}`} style={{ textDecoration: 'none' }}>
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
                          label={post.category.name}
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
                          src={post.author.avatar}
                          alt={post.author.name}
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {post.author.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime sx={{ fontSize: 14 }} />
                          <Typography variant="caption">
                            {calculateReadingTime(post.content)} phút
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Visibility sx={{ fontSize: 14 }} />
                            <Typography variant="caption">{post.views}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ThumbUp sx={{ fontSize: 14 }} />
                            <Typography variant="caption">{post.likes}</Typography>
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
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && searchQuery && posts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Không tìm thấy kết quả
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hãy thử tìm kiếm với từ khóa khác
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {!loading && !searchQuery && (
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