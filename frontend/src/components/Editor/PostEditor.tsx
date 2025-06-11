'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Alert,
} from '@mui/material';
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

interface PostEditorProps {
  onSave?: (postData: any) => void;
  onPublish: (postData: any) => void;
  initialData?: any;
  categories: Array<{ id: string; name: string; slug: string }>;
  tags: Array<{ id: string; name: string; slug: string }>;
  loading?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`editor-tabpanel-${index}`}
      aria-labelledby={`editor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const PostEditor: React.FC<PostEditorProps> = ({
  onSave,
  onPublish,
  initialData,
  categories = [],
  tags = [],
  loading = false,
}) => {
  const [tabValue, setTabValue] = useState(0);
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

  // Auto-generate excerpt from content
  useEffect(() => {
    if (postData.content && !postData.excerpt) {
      const plainText = postData.content.replace(/[#*`\[\]]/g, '').slice(0, 200);
      setPostData((prev: PostData) => ({ ...prev, excerpt: plainText + '...' }));
    }
  }, [postData.content]);

  // Auto-generate meta fields
  useEffect(() => {
    if (postData.title && !postData.metaTitle) {
      setPostData((prev: PostData) => ({ ...prev, metaTitle: postData.title }));
    }
    if (postData.excerpt && !postData.metaDescription) {
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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {initialData ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={previewMode ? 'Chế độ chỉnh sửa' : 'Chế độ xem trước'}>
              <IconButton onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? <Edit /> : <Preview />}
              </IconButton>
            </Tooltip>
            
            {onSave && (
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={loading}
              >
                Lưu nháp
              </Button>
            )}
            
            <Button
              variant="contained"
              startIcon={<Publish />}
              onClick={handlePublish}
              disabled={loading || !postData.title || !postData.content}
            >
              Xuất bản
            </Button>
          </Box>
        </Box>

        {/* Title */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tiêu đề bài viết..."
          value={postData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.5rem',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Editor Panel */}
        <Paper 
          elevation={1} 
          sx={{ 
            flex: previewMode ? 0 : 1,
            display: previewMode ? 'none' : 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Toolbar */}
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              
              <Divider orientation="vertical" flexItem />

              {/* Text Formatting */}
              <Tooltip title="Đậm">
                <IconButton size="small" onClick={() => insertMarkdown('**', '**')}>
                  <FormatBold />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Nghiêng">
                <IconButton size="small" onClick={() => insertMarkdown('*', '*')}>
                  <FormatItalic />
                </IconButton>
              </Tooltip>

              <Tooltip title="Gạch chân">
                <IconButton size="small" onClick={() => insertMarkdown('<u>', '</u>')}>
                  <FormatUnderlined />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Code">
                <IconButton size="small" onClick={() => insertMarkdown('`', '`')}>
                  <Code />
                </IconButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem />

              {/* Text Alignment */}
              <Tooltip title="Căn trái">
                <IconButton size="small" onClick={() => insertAlignment('left')}>
                  <FormatAlignLeft />
                </IconButton>
              </Tooltip>

              <Tooltip title="Căn giữa">
                <IconButton size="small" onClick={() => insertAlignment('center')}>
                  <FormatAlignCenter />
                </IconButton>
              </Tooltip>

              <Tooltip title="Căn phải">
                <IconButton size="small" onClick={() => insertAlignment('right')}>
                  <FormatAlignRight />
                </IconButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem />
              
              <Tooltip title="Danh sách">
                <IconButton size="small" onClick={() => insertMarkdown('- ')}>
                  <List />
                </IconButton>
              </Tooltip>
              
              <Divider orientation="vertical" flexItem />
              
              <Tooltip title="Hình ảnh">
                <IconButton size="small" onClick={() => insertMarkdown('![Alt text](', ')')}>
                  <ImageIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Liên kết">
                <IconButton size="small" onClick={() => insertMarkdown('[Text](', ')')}>
                  <LinkIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Content Editor */}
          <Box sx={{ flex: 1, p: 2 }}>
            <TextField
              id="content-editor"
              fullWidth
              multiline
              variant="outlined"
              placeholder="Viết nội dung bài viết của bạn ở đây... (Hỗ trợ Markdown)"
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              sx={{
                height: '100%',
                '& .MuiOutlinedInput-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: selectedFont,
                  fontSize: '14px',
                  lineHeight: 1.6,
                },
                '& .MuiOutlinedInput-input': {
                  height: '100% !important',
                  overflow: 'auto !important',
                  fontFamily: selectedFont,
                },
              }}
            />
          </Box>
        </Paper>

        {/* Preview Panel */}
        <Paper 
          elevation={1} 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight="bold">
              <Preview sx={{ mr: 1, verticalAlign: 'middle' }} />
              Xem trước
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            {postData.title && (
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {postData.title}
              </Typography>
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
          </Box>
        </Paper>

        {/* Settings Panel */}
        <Paper elevation={1} sx={{ width: 350, overflow: 'auto' }}>
          <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
            <Tab label="Cài đặt" />
            <Tab label="SEO (Tùy chọn)" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: 2, space: 2 }}>
              {/* Category */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={postData.categoryId}
                  label="Danh mục"
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Tags */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Thẻ</InputLabel>
                <Select
                  multiple
                  value={postData.tags}
                  label="Thẻ"
                  onChange={(e) => handleTagsChange(e.target.value as string[])}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value: string) => {
                        const tag = tags.find(t => t.id === value);
                        return <Chip key={value} label={tag?.name} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Featured Image */}
              <TextField
                fullWidth
                label="Ảnh đại diện"
                placeholder="URL ảnh đại diện"
                value={postData.featuredImage}
                onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Excerpt */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Tóm tắt"
                placeholder="Tóm tắt ngắn về bài viết..."
                value={postData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                sx={{ mb: 2 }}
              />

              {/* Settings */}
              <FormControlLabel
                control={
                  <Switch
                    checked={postData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                  />
                }
                label="Cho phép bình luận"
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Meta Tags
              </Typography>
              
              <TextField
                fullWidth
                label="Meta Title"
                value={postData.metaTitle}
                onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Meta Description"
                value={postData.metaDescription}
                onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Meta Keywords"
                placeholder="Từ khóa 1, từ khóa 2, ..."
                value={postData.metaKeywords}
                onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Open Graph
              </Typography>
              
              <TextField
                fullWidth
                label="OG Title"
                value={postData.ogTitle}
                onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="OG Description"
                value={postData.ogDescription}
                onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="OG Image"
                value={postData.ogImage}
                onChange={(e) => handleInputChange('ogImage', e.target.value)}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Twitter Card
              </Typography>
              
              <TextField
                fullWidth
                label="Twitter Title"
                value={postData.twitterTitle}
                onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Twitter Description"
                value={postData.twitterDescription}
                onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Twitter Image"
                value={postData.twitterImage}
                onChange={(e) => handleInputChange('twitterImage', e.target.value)}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Box>
  );
};

export default PostEditor; 