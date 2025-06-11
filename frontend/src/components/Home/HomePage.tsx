'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ArrowForward,
  Share,
  Comment,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '../Layout/MainLayout';
import { calculateReadingTime } from '../../lib/utils';
import ClientSideStats from './ClientSideStats';
import ClientSidePosts from './ClientSidePosts';
import { Post, User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { setUser } from '../../store/slices/authSlice';
import { 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { getUser } from '../../services/AuthService';
import { clientCookies } from '../../services/TokenService';

interface HomePageProps {
  postsData: Post[];
}

// Component cho các action buttons để tránh hydration mismatch
const AuthenticatedActions = ({ user, mounted }: { user: any; mounted: boolean }) => {
  if (!mounted) {
    // Render skeleton/placeholder buttons để tránh hydration mismatch
    return (
      <>
        <Button
          variant="contained"
          size="large"
          className="bg-white text-primary-600 hover:bg-gray-100"
          endIcon={<ArrowForward />}
        >
          Khám phá bài viết
        </Button>
        <Button
          variant="outlined"
          size="large"
          className="border-white text-white hover:bg-white hover:text-primary-600"
        >
          Tham gia ngay
        </Button>
      </>
    );
  }

  // Render actual authenticated UI after mount
  if (user) {
    return (
      <>
        <Button
          component={Link}
          href="/posts/create"
          variant="contained"
          size="large"
          className="bg-white text-primary-600 hover:bg-gray-100"
          endIcon={<ArrowForward />}
        >
          Tạo bài viết mới
        </Button>
        <Button
          component={Link}
          href="/dashboard"
          variant="outlined"
          size="large"
          className="border-white text-white hover:bg-white hover:text-primary-600"
        >
          Quản lý bài viết
        </Button>
      </>
    );
  }

  // Render unauthenticated UI
  return (
    <>
      <Button
        component={Link}
        href="/posts"
        variant="contained"
        size="large"
        className="bg-white text-primary-600 hover:bg-gray-100"
        endIcon={<ArrowForward />}
      >
        Khám phá bài viết
      </Button>
      <Button
        component={Link}
        href="/auth/register"
        variant="outlined"
        size="large"
        className="border-white text-white hover:bg-white hover:text-primary-600"
      >
        Tham gia ngay
      </Button>
    </>
  );
};

const HomePage = ({ postsData }: HomePageProps) => {
  const dispatch = useAppDispatch();
  const { user: reduxUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const { saveStatus } = useAppSelector((state) => state.posts);
  const posts = postsData;
  const [mounted, setMounted] = useState(false);

  // Sử dụng Redux user nếu có, fallback về server user
  const user = reduxUser;

  // Đảm bảo posts là một mảng
  const validPosts = Array.isArray(posts) ? posts : [];
  const featuredPosts = validPosts.slice(0, 3);
  const recentPosts = validPosts.slice(6, 12);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch save status cho các posts khi user đã login và posts đã load
  useEffect(() => {
    if (mounted && isAuthenticated && validPosts.length > 0) {
      const slugs = validPosts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, mounted, isAuthenticated, validPosts]);

  // Handle toggle save với optimistic update
  const handleToggleSave = (slug: string, currentSaved: boolean, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    // Optimistic update
    dispatch(optimisticToggleSave({ slug, saved: !currentSaved }));
    
    // Thực hiện API call
    dispatch(togglePostSave(slug));
  };

  return (
      <MainLayout>
        {/* Hero Section */}
        <Box className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <Container maxWidth="lg">
            <Box className="text-center">
              <Typography
                variant="h2"
                component="h1"
                className="font-bold mb-6 text-4xl md:text-6xl"
              >
                {mounted && user?.name ? (
                  <>Chào mừng trở lại, {user.name}!</>
                ) : (
                  'Chào mừng đến với'
                )}
                <br />
                <span className="text-primary-200">AdvancedBlog</span>
              </Typography>
              <Typography
                variant="h5"
                className="mb-8 text-primary-100 max-w-3xl mx-auto leading-relaxed"
              >
                Nền tảng blog hiện đại với editor markdown, SEO tối ưu, 
                analytics chi tiết và nhiều tính năng tiên tiến khác.
              </Typography>
              <Box className="flex flex-col sm:flex-row gap-4 justify-center">
                <AuthenticatedActions user={user} mounted={mounted} />
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Stats Section */}
        <ClientSideStats />

        {/* Featured Posts */}
        <Box className="py-16">
          <Container maxWidth="lg">
            <Box className="text-center mb-12">
              <Typography variant="h3" component="h2" className="font-bold mb-4">
                Bài viết nổi bật
              </Typography>
              <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
                Những bài viết được yêu thích nhất từ cộng đồng
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {featuredPosts.map((post: Post) => {
                const isSaved = saveStatus[post.slug] || false;
                
                return (
                  <Grid item xs={12} md={4} key={post.id}>
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                      <Box className="relative">
                        {post.featuredImage && (
                          <Box className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                            <Box component={Link} href={`/posts/${post.slug}`}>
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </Box> 
                          </Box>
                        )}
                        
                        {/* Save button overlay - chỉ hiển thị sau khi mounted */}
                        {mounted && isAuthenticated && (
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
                                onClick={(e) => handleToggleSave(post.slug, isSaved, e)}
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
                      
                      <CardContent className="flex-1">
                        <Box className="flex items-center gap-2 mb-3">
                          <Chip
                            label={post.category?.name || ''}
                            size="small"
                            variant="outlined"
                            className="text-primary-600 border-primary-600"
                          />
                          <Box className="flex items-center text-gray-500 text-sm">
                            <AccessTime className="w-4 h-4 mr-1" />
                            {calculateReadingTime(post.content)} phút đọc
                          </Box>
                        </Box>
                        
                        <Typography
                          variant="h6"
                          component="h3"
                          className="font-semibold mb-2 line-clamp-2"
                        >
                          {post.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3"
                        >
                          {post.excerpt}
                        </Typography>

                        <Box className="flex items-center justify-between">
                          <Box className="flex items-center gap-2">
                            <Avatar
                              src={post.author?.avatar || ''}
                              alt={post.author?.name || ''}
                              className="w-6 h-6"
                            >
                              {post.author?.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                              {post.author?.name}
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
                      </CardContent>
                      
                      <CardActions>
                        {/* Edit button - chỉ hiển thị sau khi mounted và cho chính chủ bài viết hoặc admin */}
                        {mounted && isAuthenticated && (user?.role === 'admin' || post.author?.id === user?.id) && (
                          <Button
                            component={Link}
                            href={`/posts/${post.slug}/edit`}
                            size="small"
                            className="ml-2"
                          >
                            Chỉnh sửa
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>
        </Box>

        {/* Recent Posts */}
        <ClientSidePosts initialPosts={recentPosts} />

        {/* CTA Section - chỉ hiển thị sau khi mounted */}
        {mounted && !isAuthenticated && (
          <Box className="py-16">
            <Container maxWidth="md">
              <Box className="text-center">
                <Typography variant="h3" component="h2" className="font-bold mb-4">
                  Bắt đầu hành trình viết blog
                </Typography>
                <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-8">
                  Chia sẻ kiến thức của bạn với cộng đồng và xây dựng thương hiệu cá nhân
                </Typography>
                <Box className="space-y-3">
                  <Button
                    component={Link}
                    href="/auth/register"
                    variant="contained"
                    fullWidth
                    size="large"
                  >
                    Tạo tài khoản
                  </Button>
                  <Button
                    component={Link}
                    href="/about"
                    variant="outlined"
                    fullWidth
                    size="large"
                  >
                    Tìm hiểu thêm
                  </Button>
                </Box>
              </Box>
            </Container>
          </Box>
        )}
      </MainLayout>
  );
};

export default HomePage; 