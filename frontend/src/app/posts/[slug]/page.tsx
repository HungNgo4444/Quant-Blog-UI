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
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
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
import Link from 'next/link';
import { notificationService } from '../../../services/NotificationService';
import { useSelector } from 'react-redux';
import { RootState } from 'frontend/src/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Global variable to store base64 images for current render
let currentBase64Images: Array<{ id: string; src: string; alt: string }> = [];

// Function to process content and extract base64 images for separate handling
const processContentWithImages = (content: string) => {
  currentBase64Images = []; // Reset for each render
  
  // Find all base64 images and replace with placeholders
  const base64ImageRegex = /<img[^>]+src="data:image\/[^;]+;base64,[^"]*"[^>]*>/g;
  let processedContent = content;
  let match;
  let imageIndex = 0;
  
  while ((match = base64ImageRegex.exec(content)) !== null) {
    const imgTag = match[0];
    
    // Extract src and alt from the img tag
    const srcMatch = imgTag.match(/src="([^"]*)"/);
    const altMatch = imgTag.match(/alt="([^"]*)"/);
    
    if (srcMatch) {
      const imageId = `__IMAGE_PLACEHOLDER_${imageIndex}__`;
      currentBase64Images.push({
        id: imageId,
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : ''
      });
      
      // Keep as HTML img tag but with placeholder src
      processedContent = processedContent.replace(imgTag, `<img src="${imageId}" alt="${altMatch ? altMatch[1] : ''}" class="w-full h-auto rounded-lg" />`);
      imageIndex++;
    }
  }
  
  // Process empty paragraphs to preserve line breaks
  processedContent = processedContent
    .replace(/<p><\/p>/g, '<p>&nbsp;</p>') // Replace empty paragraphs with non-breaking space
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '<p>&nbsp;</p>') // Replace paragraphs with only br tags
    .replace(/<p>\s*<\/p>/g, '<p>&nbsp;</p>'); // Replace paragraphs with only whitespace
  
  return { processedContent, base64Images: currentBase64Images };
};

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
    id: string;
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
  const { user } = useSelector((state: RootState) => state.auth);

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
        if(response.liked && post?.author.id !== user?.id){
          try {
            await notificationService.createNotification({
              type: 'post_liked',
              title: 'Thích bài viết',
              message: `thích bài viết "${post?.title.substring(0, 25)}..." của bạn.`,
              recipientId: post?.author.id || '',
              actorId: user?.id || '',
              postId: post?.id || '',
              metadata: {
                postTitle: post?.title || '',
                postSlug: post?.slug || '',
                actionUrl: `/posts/${post?.slug}`
              }
            })
          } catch (error) {
            console.error('Error creating notification:', error);
          }
        }
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
        <Link href={`/profile/${post.author.id}`}>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{post.author.name}</h3>
            </div>
          </div>
        </Link>
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
          <div className="prose max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_li]:leading-7 [&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:ml-0">
            <ReactMarkdown
            components={{
              // Handle TipTap pre elements with data-language
              pre({node, children, ...props}: any) {
                const element = node;
                const dataLanguage = element?.properties?.dataLanguage;
                
                if (dataLanguage) {
                  // This is a TipTap code block - extract text content from children
                  let codeContent = '';
                  
                  // Function to recursively extract text from nested elements
                  const extractText = (child: any): string => {
                    if (typeof child === 'string') return child;
                    if (child?.props?.children) {
                      if (Array.isArray(child.props.children)) {
                        return child.props.children.map(extractText).join('');
                      }
                      return extractText(child.props.children);
                    }
                    return '';
                  };
                  
                  // Extract text from React children
                  if (children) {
                    if (Array.isArray(children)) {
                      codeContent = children.map(extractText).join('');
                    } else {
                      codeContent = extractText(children);
                    }
                  }
                  
                  return (
                    <div className="my-6 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      {/* Language badge with copy button */}
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          {dataLanguage}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(codeContent)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      
                      <div className="bg-[#1e1e1e] dark:bg-[#0d1117]">
                        <SyntaxHighlighter
                          style={vscDarkPlus as any}
                          language={dataLanguage}
                          PreTag="div"
                          customStyle={{
                            margin: '0',
                            padding: '24px',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                            background: 'transparent',
                            border: 'none',
                            borderRadius: '0',
                            overflow: 'auto'
                          }}
                          showLineNumbers={true}
                          lineNumberStyle={{
                            color: '#6e7681',
                            fontSize: '12px',
                            paddingRight: '16px',
                            marginRight: '16px',
                            borderRight: '1px solid #30363d',
                            textAlign: 'right',
                            minWidth: '40px'
                          }}
                        >
                          {codeContent}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  );
                }
                
                // Default pre behavior for markdown
                return <pre {...props}>{children}</pre>;
              },
              
              // Handle images (including base64 placeholders)
              img({node, src, alt, ...props}: any) {
                // Check if this is a base64 placeholder
                const imageData = currentBase64Images.find(img => img.id === src);
                
                if (imageData) {
                  return (
                    <img 
                      src={imageData.src} 
                      alt={imageData.alt} 
                      className="w-full h-auto rounded-lg my-4"
                      onError={(e) => {
                        console.error('Base64 Image failed to load:', e);
                      }}
                      onLoad={() => {
                      }}
                      {...props}
                    />
                  );
                }
                return (
                  <img 
                    src={src} 
                    alt={alt} 
                    className="w-full h-auto rounded-lg my-4"
                    {...props}
                  />
                );
              },

              h1({node, children, ...props}: any) {
                return <h1 className="text-4xl font-bold mb-6 break-words" {...props}>{children}</h1>;
              },

              h2({node, children, ...props}: any) {
                return <h2 className="text-3xl font-bold mb-6 break-words" {...props}>{children}</h2>;
              },

              h3({node, children, ...props}: any) {
                return <h3 className="text-2xl font-bold mb-6 break-words" {...props}>{children}</h3>;
              },

              h4({node, children, ...props}: any) {
                return <h4 className="text-xl font-bold mb-6 break-words" {...props}>{children}</h4>;
              },

              h5({node, children, ...props}: any) {
                return <h5 className="text-lg font-bold mb-6 break-words" {...props}>{children}</h5>;
              },

              h6({node, children, ...props}: any) {
                return <h6 className="text-base font-bold mb-6 break-words" {...props}>{children}</h6>;
              },

              // Handle paragraphs with proper whitespace preservation
              p({node, children, ...props}: any) {
                // Check if paragraph contains only non-breaking space (our empty line marker)
                const isEmptyLineMarker = children === '\u00a0' || 
                  (Array.isArray(children) && children.length === 1 && children[0] === '\u00a0');
                
                if (isEmptyLineMarker) {
                  return <div className="h-6" />; // Empty line spacer
                }
                
                return <p className="mb-4 leading-7 whitespace-pre-wrap" {...props}>{children}</p>;
              },

              // Handle line breaks
              br({node, ...props}: any) {
                return <br className="block h-4" {...props} />;
              },

              // Handle unordered lists
              ul({node, children, ...props}: any) {
                // Check if this is a task list
                const isTaskList = node?.properties?.dataType === 'taskList';
                
                if (isTaskList) {
                  return <ul data-type="taskList" {...props}>{children}</ul>;
                }
                
                return <ul {...props}>{children}</ul>;
              },

              // Handle ordered lists
              ol({node, children, ...props}: any) {
                return <ol {...props}>{children}</ol>;
              },

              // Handle list items
              li({node, children, ...props}: any) {
                // Check if this is a task list item
                const isTaskItem = node?.properties?.dataType === 'taskItem';
                const isChecked = node?.properties?.dataChecked === 'true' || node?.properties?.dataChecked === true;
                
                if (isTaskItem) {
                  return (
                    <li className="flex items-center gap-2 list-none" {...props}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        disabled 
                        className="rounded border-gray-300 mt-1 flex-shrink-0"
                      />
                      <span className={isChecked ? 'line-through text-gray-500' : ''}>{children}</span>
                    </li>
                  );
                }
                
                return <li {...props}>{children}</li>;
              },

              // Handle markdown code blocks
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="my-6 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    {/* Language badge with copy button */}
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                        {match[1]}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(String(children))}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    
                    <div className="bg-[#1e1e1e] dark:bg-[#0d1117]">
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: '0',
                          padding: '24px',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '0',
                          overflow: 'auto'
                        }}
                        showLineNumbers={true}
                        lineNumberStyle={{
                          color: '#6e7681',
                          fontSize: '12px',
                          paddingRight: '16px',
                          marginRight: '16px',
                          borderRight: '1px solid #30363d',
                          textAlign: 'right',
                          minWidth: '40px'
                        }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <code 
                    className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-md font-mono text-sm border border-red-200 dark:border-red-800/50"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
            }}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[]}
                      >
                            {(() => {
                const { processedContent } = processContentWithImages(post.content);
                return processedContent;
              })()}
            </ReactMarkdown>
          </div>
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
            className="flex items-center gap-2 dark:text-white"
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