'use client';

import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  AccessTime,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import Link from 'next/link';
import { calculateReadingTime } from '../../lib/utils';
import { Post } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';

interface ClientSidePostsProps {
  initialPosts: Post[];
}

const ClientSidePosts = ({ initialPosts }: ClientSidePostsProps) => {
  const dispatch = useAppDispatch();
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts?limit=6`);
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        setPosts(data.data || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    // Uncomment dòng dưới nếu muốn fetch lại data ở client-side
    // fetchPosts();
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
      // Có thể hiện modal login hoặc redirect
      return;
    }

    // Optimistic update
    dispatch(optimisticToggleSave({ slug, saved: !currentSaved }));
    
    // Thực hiện API call
    dispatch(togglePostSave(slug));
  };

  if (error) {
    return (
      <Box className="py-16 bg-gray-50 dark:bg-gray-800">
        <Container maxWidth="lg">
          <Typography color="error" align="center">
            {error}
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="py-16 bg-gray-50 dark:bg-gray-800">
      <Container maxWidth="lg">
        <Box className="text-center mb-12">
          <Typography variant="h3" component="h2" className="font-bold mb-4">
            Bài viết mới nhất
          </Typography>
          <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
            Cập nhật những kiến thức mới nhất
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {posts.map((post) => {
            const isSaved = saveStatus[post.slug] || false;
            
            return (
              <Grid item xs={12} md={6} lg={4} key={post.id}>
                <Card className="h-full relative">
                  {/* Save button overlay - chỉ hiển thị sau khi mounted */}
                  {mounted && isAuthenticated && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        borderRadius: '50%',
                        zIndex: 1,
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
                  
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-3">
                      <Chip
                        label={post.category?.name || ''}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption" className="text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="h6"
                      component="h3"
                      className="font-semibold mb-2 line-clamp-2"
                    >
                      <Link
                        href={`/posts/${post.slug}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
                    >
                      {post.excerpt}
                    </Typography>

                    <Box className="flex items-center justify-between text-sm text-gray-500">
                      <Box className="flex items-center gap-1">
                        <Avatar
                          src={post.author?.avatar || ''}
                          alt={post.author?.name || ''}
                          className="w-5 h-5"
                        >
                          {post.author?.name?.charAt(0)}
                        </Avatar>
                        {post.author?.name}
                      </Box>
                      
                      <Box className="flex items-center gap-1">
                        <AccessTime className="w-4 h-4" />
                        {calculateReadingTime(post.content)} phút đọc
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default ClientSidePosts; 