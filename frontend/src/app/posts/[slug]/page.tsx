'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Alert
} from '@mui/material';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Facebook,
  Twitter,
  LinkedIn
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { formatDate, calculateReadingTime } from '../../../lib/utils';
import axios from 'axios';
import { clientCookies } from '../../../services/TokenService';
import PostComment from '../../../components/Posts/PostComment';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
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
    bio?: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const tokens = clientCookies.getAuthTokens();
    setIsAuthenticated(!!tokens?.access_token);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPost();           // 1. Load post data
      trackView();           // 2. Track view (anonymous)
      
      // 3. Only check like status if user is authenticated
      if (isAuthenticated) {
        checkLikeStatus();   // Check if user liked this post
      }
    }
  }, [slug, isAuthenticated]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/${slug}`);
      
      setPost(response.data);
      setLikeCount(response.data.likeCount || 0);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Bài viết không tồn tại');
      } else {
        setError('Không thể tải bài viết');
      }
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await axios.post(`${API_URL}/posts/${slug}/view`);
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const checkLikeStatus = async () => {
    try {
      // Lấy token từ cookies
      const tokens = clientCookies.getAuthTokens();
      if (!tokens?.access_token) {
        // Không có token = chưa đăng nhập = chưa like
        setLiked(false);
        return;
      }

      const response = await axios.get(`${API_URL}/posts/${slug}/like-status`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      if (response.data) {
        setLiked(response.data.liked);
        // Cập nhật like count từ server (đảm bảo sync)
        setLikeCount(response.data.likeCount);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token hết hạn hoặc không hợp lệ = chưa đăng nhập = chưa like
        setLiked(false);
      } else {
        console.error('Error checking like status:', err);
        setLiked(false); // Default to not liked on error
      }
    }
  };

  const handleLike = async () => {
    try {
      // Lấy token từ cookies
      const tokens = clientCookies.getAuthTokens();
      if (!tokens?.access_token) {
        alert('Bạn cần đăng nhập để thích bài viết');
        return;
      }

      const response = await axios.post(`${API_URL}/posts/${slug}/like`, {}, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      if (response.data) {
        setLiked(response.data.liked);
        setLikeCount(response.data.likeCount);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Bạn cần đăng nhập để thích bài viết');
      } else {
        console.error('Error liking post:', err);
        alert('Có lỗi xảy ra khi thích bài viết');
      }
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        navigator.clipboard.writeText(url);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={40} sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" height={24} />
            <Skeleton variant="text" height={20} />
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={300} />
      </Container>
    );
  }

  if (error || !post) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Bài viết không tồn tại'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Featured Image */}
      {post.featuredImage && (
        <Box
          component="img"
          src={post.featuredImage}
          alt={post.title}
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
            borderRadius: 2,
            mb: 3
          }}
        />
      )}

      {/* Category */}
      <Chip 
        label={post.category.name}
        color="primary"
        sx={{ mb: 2 }}
      />

      {/* Title */}
      <Typography variant="h3" component="h1" gutterBottom>
        {post.title}
      </Typography>

      {/* Meta info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {calculateReadingTime(post.content)} phút đọc
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Visibility fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {post.viewCount} lượt xem
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {formatDate(post.publishedAt)}
        </Typography>
      </Box>

      {/* Author */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          src={post.author.avatar}
          alt={post.author.name}
          sx={{ width: 48, height: 48 }}
        />
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {post.author.name}
          </Typography>
          {post.author.bio && (
            <Typography variant="body2" color="text.secondary">
              {post.author.bio}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Content */}
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <ReactMarkdown
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={tomorrow as any}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {post.content}
        </ReactMarkdown>
      </Paper>

      {/* Tags */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {post.tags.map((tag) => (
          <Chip
            key={tag.slug}
            label={tag.name}
            variant="outlined"
            size="small"
          />
        ))}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant={liked ? 'contained' : 'outlined'}
            startIcon={liked ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLike}
          >
            {likeCount} Thích
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            Chia sẻ:
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => handleShare('facebook')}
            sx={{ color: '#1877F2' }}
          >
            <Facebook />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleShare('twitter')}
            sx={{ color: '#1DA1F2' }}
          >
            <Twitter />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleShare('linkedin')}
            sx={{ color: '#0A66C2' }}
          >
            <LinkedIn />
          </IconButton>
          <IconButton size="small" onClick={() => handleShare('copy')}>
            <Share />
          </IconButton>
        </Box>
      </Box>
      <PostComment postId={post.id} />
    </Container>
  );
}