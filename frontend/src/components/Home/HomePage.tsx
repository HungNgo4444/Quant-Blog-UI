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
} from '@mui/material';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ArrowForward,
  Share,
  Comment,
} from '@mui/icons-material';
import Link from 'next/link';
import MainLayout from '../Layout/MainLayout';
import { calculateReadingTime } from '../../lib/utils';
import ClientSideStats from './ClientSideStats';
import ClientSidePosts from './ClientSidePosts';
import { Post, User } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { setUser } from '../../store/slices/authSlice';
import { getUser } from '../../services/AuthService';
import { clientCookies } from '../../services/TokenService';

interface HomePageProps {
  postsData: Post[];
}

const HomePage = ({ postsData }: HomePageProps) => {
  const dispatch = useAppDispatch();
  const { user: reduxUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const posts = postsData;
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Fetch user trên client-side để có refresh token functionality
  useEffect(() => {
    const fetchUserIfAuthenticated = async () => {
      // Chỉ fetch nếu có token và chưa có user trong Redux
      if (clientCookies.getAuthTokens() && !reduxUser && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          const userData = await getUser();
          
          if (userData) {
            dispatch(setUser(userData));
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };
    
    fetchUserIfAuthenticated();
  }, [reduxUser, dispatch, isLoadingUser]);

  // Sử dụng Redux user nếu có, fallback về server user
  const user = reduxUser;
  const userIsAuthenticated = user;
  const canCreatePost = user?.role === 'admin';

  // Đảm bảo posts là một mảng
  const validPosts = Array.isArray(posts) ? posts : [];
  const featuredPosts = validPosts.slice(0, 3);
  const recentPosts = validPosts.slice(0, 6);

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
                {userIsAuthenticated && user?.name ? (
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
                {userIsAuthenticated ? (
                  <>
                    {canCreatePost ? (
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
                    ) : (
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
                          href="/profile"
                          variant="outlined"
                          size="large"
                          className="border-white text-white hover:bg-white hover:text-primary-600"
                        >
                          Trang cá nhân
                        </Button>
                      </>
                    )}
                  </>
                ) : (
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
                )}
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
              {featuredPosts.map((post: Post) => (
                <Grid item xs={12} md={4} key={post.id}>
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
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
                      {canCreatePost && post.author?.id === user?.id && (
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
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Recent Posts */}
        <ClientSidePosts initialPosts={recentPosts} />

        {/* CTA Section */}
        {!userIsAuthenticated && (
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