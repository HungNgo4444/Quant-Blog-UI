'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import PostEditor from '../../../../components/Editor/PostEditor';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { updatePost } from '../../../../services/PostService';
import { toast } from 'react-toastify';
import { getPostBySlugIncludingDrafts } from '../../../../services/PostService';
import { getAllCategories } from '../../../../services/CategoryService';
import { getAllTags } from '../../../../services/TagService';
import { Post } from '../../../../types';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: reduxLoading } = useAppSelector((state) => state.posts);
  
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const slug = params.slug as string;

  // Check authentication and permissions
  useEffect(() => {
    if (!isAuthenticated && authChecked) {
      router.push(`/auth/login?redirect=/posts/${slug}/edit`);
      return;
    }

    setAuthChecked(true);
  }, [isAuthenticated, router, slug, authChecked]);

  // Load post data và categories/tags
  useEffect(() => {
    if (authChecked && isAuthenticated && slug) {
      loadPostData();
      loadCategoriesAndTags();
    }
  }, [authChecked, isAuthenticated, slug]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Loading post data for slug:', slug);
      const response = await getPostBySlugIncludingDrafts(slug);
      console.log('📊 Post data received:', response);
      
      if (response) {
        setCurrentPost(response);
      } else {
        setError('Không tìm thấy bài viết');
      }
    } catch (err: any) {
      console.error('❌ Error loading post:', err);
      if (err.response?.status === 404) {
        setError('Bài viết không tồn tại');
      } else {
        setError('Không thể tải bài viết');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndTags = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getAllCategories(),
        getAllTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading categories/tags:', error);
    }
  };

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

      console.log('🚀 Publishing post with data:', formattedData);
      const result = await updatePost(currentPost.slug, formattedData);
      
      toast.success('Đã cập nhật bài viết thành công!');

      // Redirect to the updated post
      router.push(`/posts/${result.slug}`);
    } catch (error) {
      console.error('❌ Error publishing post:', error);
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

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">
          {error}
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
    tags: currentPost.tags?.map(tag => tag.id) || [],
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
      onPublish={handlePublish}
      initialData={initialData}
      categories={categories}
      tags={tags}
      loading={reduxLoading}
    />
  );
} 