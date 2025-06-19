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
  Preview,
  Edit,
  Save,
  Publish,
  ExpandMore,
  Visibility,
  VisibilityOff,
  Image as ImageIcon,
  Link as LinkIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  List,
  FormatQuote,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { toast } from 'react-toastify';
import { cn, readFile } from '../../lib/utils';

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
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedFont, setSelectedFont] = useState('system-ui');
  
  
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

  // Set initial featured image when editing
  useEffect(() => {
    if (initialData?.featuredImage && !selectedImageBase64) {
      setSelectedImageBase64(initialData.featuredImage);
    }
  }, [initialData?.featuredImage, selectedImageBase64, setSelectedImageBase64]);

  // Sync selectedImageBase64 with postData.featuredImage
  useEffect(() => {
    if (selectedImageBase64) {
      setPostData((prev: PostData) => ({ ...prev, featuredImage: selectedImageBase64 }));
    }
  }, [selectedImageBase64]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (postData.content && postData.excerpt.length < 100) {
      const plainText = postData.content.replace(/[#*`\[\]]/g, '').slice(0, 100);
      setPostData((prev: PostData) => ({ ...prev, excerpt: plainText + '...' }));
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
    setPostData((prev: PostData) => ({ ...prev, tags: tagIds }));
  }, []);

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postData.content.substring(start, end);
    const newText = postData.content.substring(0, start) + before + selectedText + after + postData.content.substring(end);
    
    handleInputChange('content', newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [postData.content, handleInputChange]);

  const insertAlignment = useCallback((alignment: 'left' | 'center' | 'right') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postData.content.substring(start, end);
    
    let alignmentText = '';
    switch (alignment) {
      case 'left':
        alignmentText = `<div style="text-align: left;">\n${selectedText || 'Văn bản căn trái'}\n</div>`;
        break;
      case 'center':
        alignmentText = `<div style="text-align: center;">\n${selectedText || 'Văn bản căn giữa'}\n</div>`;
        break;
      case 'right':
        alignmentText = `<div style="text-align: right;">\n${selectedText || 'Văn bản căn phải'}\n</div>`;
        break;
    }
    
    const newText = postData.content.substring(0, start) + alignmentText + postData.content.substring(end);
    handleInputChange('content', newText);
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  }, [postData.content, handleInputChange]);

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
              <h1 className="text-2xl font-bold">
                {initialData ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
              </h1>
              
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                      className="hidden md:inline-flex"
                    >
                      {previewMode ? <Edit className="w-4 h-4" /> : <Preview className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {previewMode ? 'Chế độ chỉnh sửa' : 'Chế độ xem trước'}
                  </TooltipContent>
                </Tooltip>
                
                {/* Mobile preview toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex md:hidden"
                >
                  {previewMode ? <Edit className="w-4 h-4 mr-2" /> : <Preview className="w-4 h-4 mr-2" />}
                  {previewMode ? 'Chỉnh sửa' : 'Xem trước'}
                </Button>
                
                {onSave && (
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
                  Xuất bản
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
          {/* Editor Panel */}
          <Card 
            className={cn(
              "flex flex-col overflow-hidden min-h-96 md:min-h-[600px]",
              previewMode ? "hidden lg:hidden" : "flex-1 lg:flex-1"
            )}
          >
            {/* Toolbar */}
            <div className="p-2 border-b">
              <div className="flex gap-1 flex-wrap items-center">
                
                <Separator orientation="vertical" className="h-6" />

                {/* Text Formatting */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('**', '**')}>
                      <FormatBold className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Đậm</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('*', '*')}>
                      <FormatItalic className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Nghiêng</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('<u>', '</u>')}>
                      <FormatUnderlined className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Gạch chân</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('`', '`')}>
                      <Code className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Code</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                {/* Text Alignment - Hidden on mobile */}
                <div className="hidden sm:flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => insertAlignment('left')}>
                        <FormatAlignLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Căn trái</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => insertAlignment('center')}>
                        <FormatAlignCenter className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Căn giữa</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => insertAlignment('right')}>
                        <FormatAlignRight className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Căn phải</TooltipContent>
                  </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('- ')}>
                      <List className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Danh sách</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6" />
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('![Alt text](', ')')}>
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hình ảnh</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => insertMarkdown('[Text](', ')')}>
                      <LinkIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Liên kết</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-2 sm:p-4 flex flex-col">
              <Textarea
                id="content-editor"
                placeholder="Viết nội dung bài viết của bạn ở đây... (Hỗ trợ Markdown)"
                value={postData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="flex-1 min-h-80 text-xs sm:text-sm leading-relaxed resize-none"
                style={{ fontFamily: selectedFont }}
              />
            </div>
          </Card>

          {/* Preview Panel */}
          <Card 
            className={cn(
              "flex flex-col overflow-hidden min-h-96 md:min-h-[600px]",
              previewMode ? "flex-1" : "hidden lg:flex lg:flex-1"
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Preview className="w-5 h-5 mr-2" />
                Xem trước
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-auto p-4 sm:p-6">
              {postData.title && (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
                  {postData.title}
                </h1>
              )}
              
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  code({ className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
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
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  div({ children, style, ...props }: any) {
                    return <div style={style} {...props}>{children}</div>;
                  },
                  u({ children, ...props }: any) {
                    return <u {...props}>{children}</u>;
                  },
                }}
              >
                {postData.content || '*Nội dung sẽ hiển thị ở đây...*'}
              </ReactMarkdown>
            </CardContent>
          </Card>

          {/* Settings Panel */}
          <Card className="w-full lg:w-80 min-h-auto md:min-h-[600px] overflow-auto">
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
                    onValueChange={(value) => {
                      if (!postData.tags.includes(value)) {
                        handleTagsChange([...postData.tags, value]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Thêm thẻ" />
                    </SelectTrigger>
                    <SelectContent>
                      {tags.filter(tag => !postData.tags.includes(tag.id)).map((tag) => (
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