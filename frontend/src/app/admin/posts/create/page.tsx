'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Save,
  Preview,
  Schedule,
  Public,
  ArrowBack,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import MarkdownEditor from '../../../../components/Editor/MarkdownEditor';
import { calculateReadingTime } from '../../../../lib/utils';

interface PostFormData {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  categoryId: string;
  tags: string[];
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt?: Date;
  allowComments: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function CreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showSeoSettings, setShowSeoSettings] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormData>({
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      slug: '',
      categoryId: '',
      tags: [],
      featuredImage: '',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      status: 'draft',
      allowComments: true,
      featured: false,
    },
  });

  const watchTitle = watch('title');
  const watchContent = watch('content');
  const watchStatus = watch('status');

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setValue('slug', slug);
      
      // Auto-generate SEO title if not set
      if (!watch('seoTitle')) {
        setValue('seoTitle', watchTitle);
      }
    }
  }, [watchTitle, setValue, watch]);

  const fetchCategories = async () => {
    try {
      const mockCategories: Category[] = [
        { id: '1', name: 'Technology', slug: 'technology' },
        { id: '2', name: 'Tutorial', slug: 'tutorial' },
        { id: '3', name: 'News', slug: 'news' },
        { id: '4', name: 'Review', slug: 'review' },
        { id: '5', name: 'Guide', slug: 'guide' },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const mockTags: Tag[] = [
        { id: '1', name: 'TypeScript', slug: 'typescript' },
        { id: '2', name: 'React', slug: 'react' },
        { id: '3', name: 'Next.js', slug: 'nextjs' },
        { id: '4', name: 'NestJS', slug: 'nestjs' },
        { id: '5', name: 'JavaScript', slug: 'javascript' },
        { id: '6', name: 'Programming', slug: 'programming' },
        { id: '7', name: 'Web Development', slug: 'web-development' },
        { id: '8', name: 'Frontend', slug: 'frontend' },
        { id: '9', name: 'Backend', slug: 'backend' },
      ];
      setAvailableTags(mockTags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      setLoading(true);
      
      // Auto-generate excerpt if not provided
      if (!data.excerpt && data.content) {
        const plainText = data.content.replace(/[#*`]/g, '').substring(0, 200);
        data.excerpt = plainText + '...';
      }

      // API call to create post
      console.log('Creating post:', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/admin/posts');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    setValue('status', 'draft');
    handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setValue('status', 'published');
    handleSubmit(onSubmit)();
  };

  const handleSchedule = () => {
    setValue('status', 'scheduled');
    handleSubmit(onSubmit)();
  };

  const readingTime = calculateReadingTime(watchContent);

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Box className="flex items-center">
          <Button
            component={Link}
            href="/admin/posts"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <Typography variant="h4" component="h1" className="font-bold">
            Tạo bài viết mới
          </Typography>
        </Box>
        
        <Box className="flex gap-2">
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={loading}
            startIcon={<Save />}
          >
            Lưu nháp
          </Button>
          
          {watchStatus === 'scheduled' ? (
            <Button
              variant="contained"
              onClick={handleSchedule}
              disabled={loading}
              startIcon={<Schedule />}
            >
              Lên lịch
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handlePublish}
              disabled={loading}
              startIcon={<Public />}
            >
              Xuất bản
            </Button>
          )}
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card className="mb-4">
              <CardContent>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Tiêu đề là bắt buộc' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tiêu đề bài viết"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="slug"
                  control={control}
                  rules={{ required: 'Slug là bắt buộc' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Slug (URL)"
                      fullWidth
                      error={!!errors.slug}
                      helperText={errors.slug?.message || 'URL hiển thị của bài viết'}
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="excerpt"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tóm tắt"
                      fullWidth
                      multiline
                      rows={3}
                      helperText="Mô tả ngắn gọn về bài viết (sẽ tự động tạo nếu bỏ trống)"
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Typography variant="h6" className="mb-3">
                  Nội dung bài viết
                  {watchContent && (
                    <Typography variant="caption" color="text.secondary" className="ml-2">
                      (Thời gian đọc: {readingTime} phút)
                    </Typography>
                  )}
                </Typography>
                
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Nội dung là bắt buộc' }}
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                      height={500}
                    />
                  )}
                />
                {errors.content && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.content.message}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader
                title="Cài đặt SEO"
                action={
                  <Switch
                    checked={showSeoSettings}
                    onChange={(e) => setShowSeoSettings(e.target.checked)}
                  />
                }
              />
              {showSeoSettings && (
                <CardContent>
                  <Controller
                    name="seoTitle"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="SEO Title"
                        fullWidth
                        helperText="Tiêu đề hiển thị trên kết quả tìm kiếm"
                        sx={{ mb: 3 }}
                      />
                    )}
                  />

                  <Controller
                    name="seoDescription"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="SEO Description"
                        fullWidth
                        multiline
                        rows={3}
                        helperText="Mô tả hiển thị trên kết quả tìm kiếm"
                        sx={{ mb: 3 }}
                      />
                    )}
                  />

                  <Controller
                    name="seoKeywords"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="SEO Keywords"
                        fullWidth
                        helperText="Từ khóa SEO, phân cách bằng dấu phẩy"
                      />
                    )}
                  />
                </CardContent>
              )}
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Publish Settings */}
            <Card className="mb-4">
              <CardHeader title="Cài đặt xuất bản" />
              <CardContent>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select {...field} label="Trạng thái">
                        <MenuItem value="draft">Bản nháp</MenuItem>
                        <MenuItem value="published">Xuất bản ngay</MenuItem>
                        <MenuItem value="scheduled">Lên lịch</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                {watchStatus === 'scheduled' && (
                  <Controller
                    name="publishedAt"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ngày xuất bản"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 3 }}
                      />
                    )}
                  />
                )}

                <Controller
                  name="allowComments"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Cho phép bình luận"
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                <Controller
                  name="featured"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Bài viết nổi bật"
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Category & Tags */}
            <Card className="mb-4">
              <CardHeader title="Phân loại" />
              <CardContent>
                <Controller
                  name="categoryId"
                  control={control}
                  rules={{ required: 'Vui lòng chọn danh mục' }}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.categoryId}>
                      <InputLabel>Danh mục</InputLabel>
                      <Select {...field} label="Danh mục">
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.categoryId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={availableTags.map(tag => tag.name)}
                      value={field.value}
                      onChange={(_, newValue) => field.onChange(newValue)}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={option}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Thẻ"
                          placeholder="Chọn hoặc tạo thẻ mới"
                        />
                      )}
                      freeSolo
                    />
                  )}
                />
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader title="Ảnh đại diện" />
              <CardContent>
                <Controller
                  name="featuredImage"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="URL ảnh đại diện"
                      fullWidth
                      placeholder="https://example.com/image.jpg"
                      helperText="URL của ảnh đại diện bài viết"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
} 