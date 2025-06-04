'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Preview,
  Code,
  Image,
  Link,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Help,
} from '@mui/icons-material';
import { calculateReadingTime } from '../../lib/utils';

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  showToolbar?: boolean;
  showPreview?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      style={{ height: '100%' }}
    >
      {value === index && children}
    </div>
  );
};

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Viết nội dung của bạn tại đây...',
  height = 400,
  showToolbar = true,
  showPreview = true,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const insertText = useCallback((text: string) => {
    const textarea = document.querySelector('.w-md-editor-text') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.slice(0, start) + text + value.slice(end);
      onChange(newValue);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  }, [value, onChange]);

  const handleBold = () => insertText('**text in đậm**');
  const handleItalic = () => insertText('*text in nghiêng*');
  const handleBulletList = () => insertText('\n- Item 1\n- Item 2\n- Item 3\n');
  const handleNumberedList = () => insertText('\n1. Item 1\n2. Item 2\n3. Item 3\n');
  const handleQuote = () => insertText('\n> Đây là một trích dẫn\n');

  const handleInsertLink = () => {
    if (linkText && linkUrl) {
      insertText(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  };

  const handleInsertImage = () => {
    if (imageAlt && imageUrl) {
      insertText(`![${imageAlt}](${imageUrl})`);
      setImageAlt('');
      setImageUrl('');
      setImageDialogOpen(false);
    }
  };

  const readingTime = calculateReadingTime(value);

  const customToolbar = showToolbar && (
    <Box className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
      <Tooltip title="Chữ đậm">
        <IconButton size="small" onClick={handleBold}>
          <FormatBold />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Chữ nghiêng">
        <IconButton size="small" onClick={handleItalic}>
          <FormatItalic />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Danh sách có dấu đầu dòng">
        <IconButton size="small" onClick={handleBulletList}>
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Danh sách có số">
        <IconButton size="small" onClick={handleNumberedList}>
          <FormatListNumbered />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Trích dẫn">
        <IconButton size="small" onClick={handleQuote}>
          <FormatQuote />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Chèn liên kết">
        <IconButton size="small" onClick={() => setLinkDialogOpen(true)}>
          <Link />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Chèn hình ảnh">
        <IconButton size="small" onClick={() => setImageDialogOpen(true)}>
          <Image />
        </IconButton>
      </Tooltip>
      
      <Box className="flex-1" />
      
      <Typography variant="caption" className="text-gray-500">
        Thời gian đọc: {readingTime} phút
      </Typography>
      
      <Tooltip title="Hướng dẫn Markdown">
        <IconButton size="small" onClick={() => setHelpOpen(true)}>
          <Help />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Paper className="border border-gray-200 dark:border-gray-700">
      {showPreview ? (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} className="border-b border-gray-200 dark:border-gray-700">
            <Tab
              icon={<Code />}
              label="Viết"
              iconPosition="start"
            />
            <Tab
              icon={<Preview />}
              label="Xem trước"
              iconPosition="start"
            />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <Box>
              {customToolbar}
              <MDEditor
                value={value}
                onChange={(val) => onChange(val || '')}
                preview="edit"
                hideToolbar
                visibleDragbar={false}
                height={height}
                data-color-mode="light"
              />
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box style={{ height }}>
              <MDEditor
                value={value}
                preview="preview"
                hideToolbar
                visibleDragbar={false}
                height={height}
                data-color-mode="light"
              />
            </Box>
          </TabPanel>
        </>
      ) : (
        <Box>
          {customToolbar}
          <MDEditor
            value={value}
            onChange={(val) => onChange(val || '')}
            preview="edit"
            hideToolbar
            visibleDragbar={false}
            height={height}
            data-color-mode="light"
          />
        </Box>
      )}

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chèn liên kết</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Văn bản hiển thị"
            fullWidth
            variant="outlined"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className="mb-4"
          />
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            variant="outlined"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleInsertLink} variant="contained">Chèn</Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chèn hình ảnh</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Alt text"
            fullWidth
            variant="outlined"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className="mb-4"
          />
          <TextField
            margin="dense"
            label="URL hình ảnh"
            fullWidth
            variant="outlined"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleInsertImage} variant="contained">Chèn</Button>
        </DialogActions>
      </Dialog>

      {/* Help Dialog */}
      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Hướng dẫn Markdown</DialogTitle>
        <DialogContent>
          <Box className="space-y-4">
            <Box>
              <Typography variant="h6" className="font-semibold mb-2">Tiêu đề</Typography>
              <Box className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <Typography variant="body2" className="font-mono">
                  # Tiêu đề 1<br />
                  ## Tiêu đề 2<br />
                  ### Tiêu đề 3
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" className="font-semibold mb-2">Định dạng văn bản</Typography>
              <Box className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <Typography variant="body2" className="font-mono">
                  **Chữ đậm**<br />
                  *Chữ nghiêng*<br />
                  `Code inline`<br />
                  ~~Gạch ngang~~
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" className="font-semibold mb-2">Danh sách</Typography>
              <Box className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <Typography variant="body2" className="font-mono">
                  - Item 1<br />
                  - Item 2<br />
                  <br />
                  1. Item 1<br />
                  2. Item 2
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" className="font-semibold mb-2">Liên kết và hình ảnh</Typography>
              <Box className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <Typography variant="body2" className="font-mono">
                  [Text liên kết](https://example.com)<br />
                  ![Alt text](https://example.com/image.jpg)
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" className="font-semibold mb-2">Trích dẫn và code block</Typography>
              <Box className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                <Typography variant="body2" className="font-mono">
                  &gt; Đây là trích dẫn<br />
                  <br />
                  ```javascript<br />
                  const code = "Hello World";<br />
                  ```
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default MarkdownEditor; 