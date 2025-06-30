'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Save,
  Publish,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { cn, readFile, extractExcerpt } from '../../lib/utils';
import TiptapEditor from './TiptapEditor';

interface PostEditorProps {
  onSave?: (postData: any) => void;
  onPublish: (postData: any) => void;
  initialData?: any;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  loading?: boolean;
  selectedImageBase64: string;
  setSelectedImageBase64: (base64: string) => void;
}

interface PostData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  featuredImage: string;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  allowComments: boolean;
}

const PostEditor: React.FC<PostEditorProps> = ({
  onSave,
  onPublish,
  initialData,
  categories = [],
  tags = [],
  loading = false,
  selectedImageBase64,
  setSelectedImageBase64,
}) => {
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  useEffect(() => {
    setTagsfiltered(tags);
  }, [tags]);
  const [tagsfiltered, setTagsfiltered] = useState(tags);
  
  // Post data state
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [] as string[],
    featuredImage: '',
    published: false,
    // SEO fields
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
    allowComments: true,
    ...initialData,
  });

  // Auto-generate excerpt from content
  useEffect(() => {
    if (postData.content && postData.excerpt.length < 100 && !initialData) {
      const excerpt = `${extractExcerpt(postData.content, 100)}`;
      setPostData((prev: PostData) => ({ ...prev, excerpt }));
    }
  }, [postData.content]);

  // Auto-generate meta fields
  useEffect(() => {
    if (postData.title && postData.metaTitle.length < 50) {
      setPostData((prev: PostData) => ({ ...prev, metaTitle: postData.title }));
    }
    if (postData.excerpt && postData.metaDescription.length < 100) {
      setPostData((prev: PostData) => ({ ...prev, metaDescription: postData.excerpt }));
    }
  }, [postData.title, postData.excerpt]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setPostData((prev: PostData) => ({ ...prev, [field]: value }));
  }, []);

  const handleTagsChange = useCallback((tagIds: string[]) => {
    // setTagsfiltered(tags.filter(tag => !tagIds.includes(tag.id)));
    setPostData((prev: PostData) => ({ ...prev, tags: tagIds }));
  }, []);



  const handleSave = useCallback(() => {
    onSave?.(postData);
  }, [onSave, postData]);

  const handlePublish = useCallback(() => {
    onPublish({ ...postData, published: true });
  }, [onPublish, postData]);

  const handleImageChange = useCallback((file: File | null) => {
    if (!file) return;
    readFile(file).then((base64) => {
      setSelectedImageBase64(base64);
    });
  }, [setSelectedImageBase64]);

  return (
    <TooltipProvider>
      <div className="min-h-[calc(100vh-120px)] flex flex-col pb-2">
        {/* Header */}
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-4 gap-4 sm:gap-0">
              
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                {onSave && !initialData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu nháp
                  </Button>
                )}
                
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={loading || !postData.title || !postData.content}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Publish className="w-4 h-4 mr-2" />
                  {initialData ? 'Cập nhật' : 'Xuất bản'}
                </Button>
              </div>
            </div>

            {/* Title */}
            <Input
              placeholder="Tiêu đề bài viết..."
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-xl sm:text-2xl font-bold"
            />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[calc(100vh-300px)]">
          {/* Tiptap Editor */}
          <div className="flex-1 lg:flex-[2]">
            <TiptapEditor
              content={postData.content}
              onChange={(content) => handleInputChange('content', content)}
              placeholder="Viết nội dung bài viết của bạn ở đây..."
              className="h-full min-h-[600px]"
            />
          </div>

          {/* Settings Panel */}
          <Card className="w-full lg:w-80 lg:flex-[1] min-h-auto md:min-h-[600px] overflow-auto">
            <Tabs defaultValue="settings" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="settings" className="text-xs sm:text-sm">
                  Cài đặt
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="p-2 sm:p-4 space-y-4">
                {/* Category */}
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <Select value={postData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Thẻ</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {postData.tags.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <Badge
                          key={tagId}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            const newTags = postData.tags.filter(id => id !== tagId);
                            handleTagsChange(newTags);
                          }}
                        >
                          {tag.name} ×
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Select 
                    open={tagDropdownOpen}
                    onOpenChange={setTagDropdownOpen}
                    onValueChange={(value) => {
                      if (!postData.tags.includes(value)) {
                        handleTagsChange([...postData.tags, value]);
                        setTagsfiltered(tags.filter(tag => !postData.tags.includes(tag.id)));
                        setTimeout(() => setTagDropdownOpen(true), 50);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Thêm thẻ" />
                    </SelectTrigger>
                    <SelectContent>
                      <Input placeholder="Tìm thẻ" className='mb-1' onChange={(e) => {
                        const filterTags = tags.filter(tag => tag.name.toLowerCase().includes(e.target.value.toLowerCase()));
                        setTagsfiltered(filterTags);
                      }}/>
                      {tagsfiltered.filter(tag => !postData.tags.includes(tag.id)).map((tag) => (
                        <SelectItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ảnh đại diện</Label>
                  <Input
                    type="file"
                    placeholder="Chọn ảnh đại diện"
                    onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                    className="text-xs sm:text-sm cursor-pointer"
                  />
                  {selectedImageBase64 && (
                    <img src={selectedImageBase64} alt="Ảnh đại diện" className="w-full h-auto rounded-lg" />
                  )}
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label>Tóm tắt</Label>
                  <Textarea
                    rows={3}
                    placeholder="Tóm tắt ngắn về bài viết...(tối đa 100 ký tự)"
                    value={postData.excerpt}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) {
                        handleInputChange('excerpt', e.target.value);
                      }
                    }}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {postData.excerpt.length}/100 ký tự
                  </p>
                </div>

                {/* Settings */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allow-comments"
                    checked={postData.allowComments}
                    onCheckedChange={(checked) => handleInputChange('allowComments', checked)}
                  />
                  <Label htmlFor="allow-comments">Cho phép bình luận</Label>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PostEditor; 