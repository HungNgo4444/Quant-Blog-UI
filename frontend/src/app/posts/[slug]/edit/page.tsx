'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import PostEditor from '../../../../components/Editor/PostEditor';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { updatePost, fetchPostBySlug, clearCurrentPost } from '../../../../store/slices/postsSlice';
import { toast } from 'react-toastify';

// Mock data - trong thực tế sẽ fetch từ API
const mockCategories = [
  { id: '1', name: 'Technology', slug: 'technology' },
  { id: '2', name: 'Tutorial', slug: 'tutorial' },
  { id: '3', name: 'Programming', slug: 'programming' },
  { id: '4', name: 'Web Development', slug: 'web-development' },
  { id: '5', name: 'DevOps', slug: 'devops' },
];

const mockTags = [
  { id: '1', name: 'TypeScript', slug: 'typescript' },
  { id: '2', name: 'JavaScript', slug: 'javascript' },
  { id: '3', name: 'React', slug: 'react' },
  { id: '4', name: 'Next.js', slug: 'nextjs' },
  { id: '5', name: 'Node.js', slug: 'nodejs' },
  { id: '6', name: 'NestJS', slug: 'nestjs' },
  { id: '7', name: 'PostgreSQL', slug: 'postgresql' },
  { id: '8', name: 'Docker', slug: 'docker' },
  { id: '9', name: 'AWS', slug: 'aws' },
  { id: '10', name: 'Frontend', slug: 'frontend' },
  { id: '11', name: 'Backend', slug: 'backend' },
  { id: '12', name: 'Full-stack', slug: 'fullstack' },
];

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentPost, loading } = useAppSelector((state) => state.posts);
  
  const [authChecked, setAuthChecked] = useState(false);
  const [postLoaded, setPostLoaded] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const slug = params.slug as string;

  // Check authentication and permissions
  useEffect(() => {
    if (!isAuthenticated && authChecked) {
      router.push(`/auth/login?redirect=/posts/${slug}/edit`);
      return;
    }

    setAuthChecked(true);
  }, [isAuthenticated, router, dispatch, slug, authChecked]);

  // Load post data
  useEffect(() => {
    if (authChecked && isAuthenticated && slug && !postLoaded) {
      dispatch(fetchPostBySlug(slug));
      setPostLoaded(true);
    }
  }, [authChecked, isAuthenticated, slug, dispatch, postLoaded]);

  // Check edit permissions after post is loaded
  useEffect(() => {
    if (currentPost && user) {
      // User có thể edit nếu là admin hoặc là tác giả của bài viết
      const canUserEdit = user.role === 'admin' || currentPost.authorId === user.id;
      setCanEdit(canUserEdit);
      
      if (!canUserEdit) {
        toast.error('Bạn không có quyền chỉnh sửa bài viết này');
        router.push(`/posts/${slug}`);
      }
    }
  }, [currentPost, user, router, slug]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch]);

  const handleSave = async (postData: any) => {
    if (!currentPost) return;

    try {
      const formattedData = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        categoryId: postData.categoryId,
        tags: postData.tags,
        featured_image: postData.featuredImage,
        published: false, // Lưu nháp
        seoTitle: postData.metaTitle,
        seoDescription: postData.metaDescription,
      };

      await dispatch(updatePost({ 
        id: currentPost.slug, // Backend expects slug as ID
        postData: formattedData 
      })).unwrap();
      
      toast.success('Đã lưu bài viết thành công!');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Có lỗi xảy ra khi lưu bài viết');
    }
  };

  const handlePublish = async (postData: any) => {
    if (!currentPost) return;

    try {
      if (!postData.title || !postData.content) {
        toast.warning('Vui lòng nhập tiêu đề và nội dung bài viết');
        return;
      }

      if (!postData.categoryId) {
        toast.warning('Vui lòng chọn danh mục cho bài viết');
        return;
      }

      const formattedData = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        categoryId: postData.categoryId,
        tags: postData.tags,
        featured_image: postData.featuredImage,
        published: true, // Xuất bản
        seoTitle: postData.metaTitle,
        seoDescription: postData.metaDescription,
      };

      const result = await dispatch(updatePost({ 
        id: currentPost.slug, // Backend expects slug as ID
        postData: formattedData 
      })).unwrap();
      
      toast.success('Đã cập nhật bài viết thành công!');

      // Redirect to the updated post
      router.push(`/posts/${result.slug}`);
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bài viết');
    }
  };

  if (!authChecked || loading) {
    return (
      <Box 
        sx={{ 
          height: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="warning">
          Vui lòng đăng nhập để chỉnh sửa bài viết.
        </Alert>
      </Container>
    );
  }

  if (!currentPost) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          Không tìm thấy bài viết.
        </Alert>
      </Container>
    );
  }

  if (!canEdit) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          Bạn không có quyền chỉnh sửa bài viết này.
        </Alert>
      </Container>
    );
  }

  // Prepare initial data for editor
  const initialData = {
    title: currentPost.title,
    content: currentPost.content,
    excerpt: currentPost.excerpt,
    categoryId: currentPost.categoryId,
    tags: currentPost.tags.map(tag => tag.id),
    featuredImage: currentPost.featuredImage || '',
    published: currentPost.status === 'published',
    metaTitle: currentPost.metaTitle || '',
    metaDescription: currentPost.metaDescription || '',
    metaKeywords: currentPost.metaKeywords || '',
    ogTitle: currentPost.ogTitle || '',
    ogDescription: currentPost.ogDescription || '',
    ogImage: currentPost.ogImage || '',
    twitterTitle: currentPost.twitterTitle || '',
    twitterDescription: currentPost.twitterDescription || '',
    twitterImage: currentPost.twitterImage || '',
    allowComments: currentPost.allowComments,
  };

  return (
    <PostEditor
      onSave={handleSave}
      onPublish={handlePublish}
      initialData={initialData}
      categories={mockCategories}
      tags={mockTags}
      loading={loading}
    />
  );
} 