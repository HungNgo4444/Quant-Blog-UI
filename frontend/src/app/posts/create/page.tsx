'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostEditor from '../../../components/Editor/PostEditor';
import LoadingComponent from '../../../components/Common/LoadingComponent';
import { useAppSelector, useAppDispatch } from '../../../store';
import { toast } from 'react-toastify';
import { getAllCategories } from '../../../services/CategoryService';
import { getAllTags } from '../../../services/TagService';
import { createPost } from 'frontend/src/services/PostService';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';

export default function CreatePostPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading } = useAppSelector((state) => state.posts);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState("");
  const [savingLoading, setSavingLoading] = useState(false);
  const [publishingLoading, setPublishingLoading] = useState(false);
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
      setSavingLoading(true);
      const formattedData = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        categoryId: postData.categoryId,
        tags: postData.tags,
        featured_image: selectedImageBase64,
        published: false, // Lưu nháp
        seoTitle: postData.metaTitle,
        seoDescription: postData.metaDescription,
      };

      const result = await createPost(formattedData);
      
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
      } else if (error.response?.data.message === 'Featured image is required') {
        toast.error('Vui lòng chọn ảnh đại diện cho bài viết.');
      } else if (error.response?.data.message === 'Conflict slug') {
        toast.error('Tiêu đề đã tồn tại. Vui lòng nhập tiêu đề khác.');
      } else {
        toast.error('Có lỗi xảy ra khi xuất bản bài viết');
      }
    } finally {
      setSavingLoading(false);
    }
  };

  const handlePublish = async (postData: any) => {
    try {
      setPublishingLoading(true);
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
        featured_image: selectedImageBase64,
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
      } else if (error.response?.data.message === 'Featured image is required') {
        toast.error('Vui lòng chọn ảnh đại diện cho bài viết.');
      } else if (error.response?.data.message === 'Conflict slug') {
        toast.error('Tiêu đề đã tồn tại. Vui lòng nhập tiêu đề khác.');
      } else {
        toast.error('Có lỗi xảy ra khi xuất bản bài viết');
      }
    } finally {
      setPublishingLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        <Alert>
          <AlertDescription>
            Vui lòng đăng nhập để tạo bài viết mới.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      {savingLoading && <LoadingComponent />}
      {publishingLoading && <LoadingComponent />}
      <PostEditor
        onSave={handleSave}
        onPublish={handlePublish}
        categories={categories}
        tags={tags}
        loading={loading}
        selectedImageBase64={selectedImageBase64}
        setSelectedImageBase64={setSelectedImageBase64}
      />
    </>
  );
} 