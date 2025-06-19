'use client';

import React, { useState, useEffect } from 'react';
import {
  AccessTime,
  Visibility,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import { formatDate, calculateReadingTime } from '../../../lib/utils';
import axios from 'axios';
import { clientCookies } from '../../../services/TokenService';
import PostComment from '../../../components/Posts/PostComment';
import { getLikeStatus, getPostBySlug, getSaveStatus, toggleLikePost, toggleSavePost, trackViewPost } from 'frontend/src/services/PostService';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Skeleton } from '../../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../../components/ui/alert';

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
  const [saved, setSaved] = useState(false);

  // Check authentication status
  useEffect(() => {
    const tokens = clientCookies.getAuthTokens();
    setIsAuthenticated(!!tokens?.accessToken);
  }, []);

  useEffect(() => {
    if (slug) {
      fetchPost();           // 1. Load post data
      trackView();           // 2. Track view (anonymous)
      
      // 3. Only check like status if user is authenticated
      if (isAuthenticated) {
        checkLikeStatus();   // Check if user liked this post
        checkSavedPost();
      }
    }
  }, [slug, isAuthenticated]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPostBySlug(slug);
      
      setPost(response);
      setLikeCount(response.likeCount || 0);
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
      await trackViewPost(slug);
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const checkLikeStatus = async () => {
    try {
      // Lấy token từ cookies
      const tokens = clientCookies.getAuthTokens();
      if (!tokens?.accessToken) {
        // Không có token = chưa đăng nhập = chưa like
        setLiked(false);
        return;
      }

      const response = await getLikeStatus(slug);

      if (response) {
        setLiked(response.liked);
        // Cập nhật like count từ server (đảm bảo sync)
        setLikeCount(response.likeCount);
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
      if (!tokens?.accessToken) {
        alert('Bạn cần đăng nhập để thích bài viết');
        return;
      }

      const response = await toggleLikePost(slug);

      if (response) {
        setLiked(response.liked);
        setLikeCount(response.likeCount);
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

  const handleSavePost = async () => {
    try {
      const response = await toggleSavePost(slug);
      if(response.saved){
        toast.success('Đã lưu bài viết');
        setSaved(true);
      } else {
        toast.success('Đã bỏ lưu bài viết');
        setSaved(false);
      }
    } catch (err: any) {
      console.error('Error saving post:', err);
      if(!isAuthenticated){
        toast.error('Bạn cần đăng nhập để lưu bài viết');
      } else {
        toast.error('Không thể lưu bài viết');
      }
    }
  }

  const checkSavedPost = async () => {
    try {
      const response = await getSaveStatus(slug);
        setSaved(response.saved);
    } catch (error) {
      console.error('Error checking saved post:', error);
    }
    
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="w-full h-96 mb-6" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-6" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            {error || 'Bài viết không tồn tại'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Featured Image */}
      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.title}
          className="w-full h-96 object-cover rounded-lg mb-6"
        />
      )}

      {/* Category */}
      <Badge 
        variant="secondary" 
        className="mb-4 text-blue-700 bg-blue-100"
      >
        {post.category.name}
      </Badge>

      {/* Title */}
      <h1 className="text-4xl font-bold mb-6 break-words">
        {post.title}
      </h1>

      {/* Meta info */}
      <div className="flex items-center gap-6 text-gray-600 mb-6">
        <div className="flex items-center gap-2">
          <AccessTime className="h-4 w-4" />
          <span className="text-sm">
            {calculateReadingTime(post.content)} phút đọc
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Visibility className="h-4 w-4" />
          <span className="text-sm">
            {post.viewCount} lượt xem
          </span>
        </div>
        <span className="text-sm">
          {formatDate(post.publishedAt)}
        </span>
      </div>

      {/* Author */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.author.name}</h3>
            {post.author.bio && (
              <p className="text-sm text-gray-600">{post.author.bio}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSavePost}
          className="ml-auto"
          title={saved ? 'Bỏ lưu' : 'Lưu bài viết'}
        >
          {saved ? (
            <Bookmark className="h-5 w-5 text-blue-600" />
          ) : (
            <BookmarkBorder className="h-5 w-5" />
          )}
        </Button>
      </div>

      <hr className="mb-6" />

      {/* Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <ReactMarkdown
            components={{
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow as any}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      backgroundColor: '#1e1e1e',
                      color: '#d4d4d4',
                      padding: '20px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: '20px 0',
                      border: '1px solid #3c3c3c',
                      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Droid Sans Mono", "Liberation Mono", Menlo, Courier, monospace',
                      fontWeight: '400',
                      overflow: 'auto',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                    }}
                    codeTagProps={{
                      style: {
                        fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Droid Sans Mono", "Liberation Mono", Menlo, Courier, monospace',
                        fontSize: '14px',
                        lineHeight: '1.6'
                      }
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code 
                    className={className} 
                    {...props}
                    style={{
                      backgroundColor: '#2d2d30',
                      color: '#cccccc',
                      padding: '3px 6px',
                      borderRadius: '3px',
                      fontSize: '13px',
                      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", "Droid Sans Mono", "Liberation Mono", Menlo, Courier, monospace',
                      border: '1px solid #404040',
                      fontWeight: '400',
                      letterSpacing: '0.025em'
                    }}
                  >
                    {children}
                  </code>
                );
              }
            }}
            rehypePlugins={[rehypeRaw]}
          >
            {post.content}
          </ReactMarkdown>
        </CardContent>
      </Card>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {post.tags.map((tag) => (
          <Badge
            key={tag.slug}
            variant="outline"
          >
            {tag.name}
          </Badge>
        ))}
      </div>

      <hr className="mb-6" />

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant={liked ? 'default' : 'outline'}
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            {liked ? <ThumbUp className="h-4 w-4" /> : <ThumbUpOutlined className="h-4 w-4" />}
            {likeCount} Thích
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleShare('facebook')}
            className="text-blue-600 hover:text-blue-700"
          >
            <Facebook className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleShare('twitter')}
            className="text-blue-400 hover:text-blue-500"
          >
            <Twitter className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleShare('linkedin')}
            className="text-blue-700 hover:text-blue-800"
          >
            <LinkedIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleShare('copy')}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <PostComment postId={post.id} />
    </div>
  );
}