'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PostEditor from '../../../../components/Editor/PostEditor';
import LoadingComponent from '../../../../components/Common/LoadingComponent';
import { useAppSelector, useAppDispatch } from '../../../../store';
import { updatePost } from '../../../../services/PostService';
import { toast } from 'react-toastify';
import { getPostBySlugIncludingDrafts } from '../../../../services/PostService';
import { getAllCategories } from '../../../../services/CategoryService';
import { getAllTags } from '../../../../services/TagService';
import { Post } from '../../../../types';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { Card, CardContent } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { loading: reduxLoading } = useAppSelector((state) => state.posts);
  const [selectedImageBase64, setSelectedImageBase64] = useState("");
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  
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
      
      const response = await getPostBySlugIncludingDrafts(slug);
      console.log(response);
      if (response) {
        setCurrentPost(response);
      } else {
        setError('Không tìm thấy bài viết');
      }
    } catch (err: any) {
      console.error('Error loading post:', err);
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
        featured_image: selectedImageBase64.includes('data:image') ? selectedImageBase64 : undefined,
        published: true, // Xuất bản
        seoTitle: postData.metaTitle,
        seoDescription: postData.metaDescription,
      };

      const result = await updatePost(currentPost.slug, formattedData);
      
      toast.success('Đã cập nhật bài viết thành công!');

      // Redirect to the updated post
      router.push(`/posts/${result.slug}`);
    } catch (error) {
      console.error('Error publishing post:', error);
      toast.error('Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setPublishingLoading(false);
    }
  };

  const handleSave = async (postData: any) => {
    if (!currentPost) return;

    try {
      setSavingLoading(true);
      const formattedData = {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        categoryId: postData.categoryId,
        tags: postData.tags,
        featured_image: selectedImageBase64.includes('data:image') ? selectedImageBase64 : undefined,
        published: false, // Lưu nháp
        seoTitle: postData.metaTitle,
        seoDescription: postData.metaDescription,
      };

      const result = await updatePost(currentPost.slug, formattedData);
      
      toast.success('Đã lưu bài viết thành công!');

      // Update current post data
      setCurrentPost(result);
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Có lỗi xảy ra khi lưu bài viết');
    } finally {
      setSavingLoading(false);
    }
  };

  if (!authChecked || loading) {
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
            Vui lòng đăng nhập để chỉnh sửa bài viết.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        <Alert>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        <Alert>
          <AlertDescription>
            Không tìm thấy bài viết.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="max-w-md mx-auto mt-8 px-4">
        <Alert>
          <AlertDescription>
            Bạn không có quyền chỉnh sửa bài viết này.
          </AlertDescription>
        </Alert>
      </div>
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
    <>
      {savingLoading && <LoadingComponent />}
      {publishingLoading && <LoadingComponent />}
      <PostEditor
        onPublish={handlePublish}
        onSave={handleSave}
        initialData={initialData}
        categories={categories}
        tags={tags}
        loading={reduxLoading}
        selectedImageBase64={selectedImageBase64}
        setSelectedImageBase64={setSelectedImageBase64}
      />
    </>
  );
} 