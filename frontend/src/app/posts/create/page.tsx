'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Alert, CircularProgress, Box } from '@mui/material';
import PostEditor from '../../../components/Editor/PostEditor';
import { useAppSelector, useAppDispatch } from '../../../store';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../../services/CategoryService';
import { getAllTags } from '../../../services/TagService';
import { createPost } from 'frontend/src/services/PostService';

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.posts);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication - cho phép cả user và admin
  useEffect(() => {
    if (!isAuthenticated && authChecked) {
      router.push('/auth/login?redirect=/posts/create');
      return;
    }
    
    // Không cần kiểm tra role nữa - cho phép tất cả user đã đăng nhập
    setAuthChecked(true);
  }, [isAuthenticated, router, authChecked]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getAllCategories();
      setCategories(categories);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const tags = await getAllTags();  
      setTags(tags);
    }
    fetchTags();
  }, []);

  const handleSave = async (postData: any) => {
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

      console.log('Saving draft with data:', formattedData);
      const result = await createPost(formattedData);
      console.log('Draft saved successfully:', result);
      
      toast.success('Đã lưu bài viết thành công!');
      
      // Redirect to edit page if we have a slug
      if (result && result.slug) {
        router.push(`/posts/${result.slug}/edit`);
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy tài nguyên. Vui lòng thử lại.');
      } else if (error.response?.status === 400) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại cài đặt.');
      } else {
        toast.error('Có lỗi xảy ra khi lưu bài viết');
      }
    }
  };

  const handlePublish = async (postData: any) => {
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

      console.log('Publishing post with data:', formattedData);
      const result = await createPost(formattedData);
      console.log('Post published successfully:', result);
      
      toast.success('Đã xuất bản bài viết thành công!');

      // Redirect to the created post
      if (result && result.slug) {
        router.push(`/posts/${result.slug}`);
      }
    } catch (error: any) {
      console.error('Error publishing post:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy tài nguyên. Vui lòng thử lại.');
      } else if (error.response?.status === 400) {
        toast.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        toast.error('Có lỗi xảy ra khi xuất bản bài viết');
      }
    }
  };

  if (!authChecked) {
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
          Vui lòng đăng nhập để tạo bài viết mới.
        </Alert>
      </Container>
    );
  }

  return (
    <PostEditor
      onSave={handleSave}
      onPublish={handlePublish}
      categories={categories}
      tags={tags}
      loading={loading}
    />
  );
} 