'use client';

import React, { useCallback, useState } from 'react';
import '../../styles/tiptap.css';
import '../../styles/editor-extensions.css';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Typography from '@tiptap/extension-typography';
import Color from '@tiptap/extension-color';
import { Node, Mark } from '@tiptap/core';
import {
  TextHighlight,
  TextSubscript,
  TextSuperscript,
  StyleExtension,
} from './extensions';

// Custom CodeBlock extension with language support
const CustomCodeBlock = Node.create({
  name: 'codeBlock',
  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,
  isolating: true,
  
  addAttributes() {
    return {
      language: {
        default: 'javascript',
        parseHTML: element => element.getAttribute('data-language') || 'javascript',
        renderHTML: attributes => {
          if (!attributes.language) return {}
          return { 'data-language': attributes.language }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node) => ({
          language: node.getAttribute('data-language') || 'javascript',
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['pre', HTMLAttributes, ['code', {}, 0]]
  },

  addCommands() {
    return {
      setCodeBlock: (attributes = { language: 'javascript' }) => ({ commands }) => {
        return commands.setNode(this.name, attributes)
      },
      toggleCodeBlock: (attributes = { language: 'javascript' }) => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph', attributes)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      'Shift-Ctrl-\\': () => this.editor.commands.toggleCodeBlock(),
    }
  },
});

// Custom TextStyle extension with inline styles
const CustomTextStyle = Mark.create({
  name: 'textStyle',

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontFamily || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontFamily) return {}
          return { style: `font-family: ${attributes.fontFamily}` }
        },
      },
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || null,
        renderHTML: (attributes: any) => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}` }
        },
      },
      backgroundColor: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.backgroundColor || null,
        renderHTML: (attributes: any) => {
          if (!attributes.backgroundColor) return {}
          return { style: `background-color: ${attributes.backgroundColor}` }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: (element: any) => {
          const hasStyles = element.style.fontFamily || element.style.fontSize || element.style.color || element.style.backgroundColor
          return hasStyles ? {} : false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }: any) {
    // Build inline styles from attributes
    const styles: string[] = []
    
    if (HTMLAttributes.fontFamily) {
      styles.push(`font-family: ${HTMLAttributes.fontFamily}`)
    }
    if (HTMLAttributes.fontSize) {
      styles.push(`font-size: ${HTMLAttributes.fontSize}`)
    }
    if (HTMLAttributes.color) {
      styles.push(`color: ${HTMLAttributes.color}`)
    }
    if (HTMLAttributes.backgroundColor) {
      styles.push(`background-color: ${HTMLAttributes.backgroundColor}`)
    }
    
    // Combine with existing style if any
    if (HTMLAttributes.style) {
      styles.push(HTMLAttributes.style)
    }
    
    const finalStyle = styles.length > 0 ? styles.join('; ') : undefined
    
    return ['span', { style: finalStyle }, 0]
  },
})

import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
  TableChart,
} from '@mui/icons-material';
import {
  Highlighter,
  Subscript,
  Superscript,
  Palette,
  IndentDecrease,
  IndentIncrease,
  AlignLeft,
} from 'lucide-react';
import { readFile } from '../../lib/utils';
import ColorPicker from './toolbar/ColorPicker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  type?: 'post' | 'question';
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onChange,
  placeholder = "",
  className = "",
  type
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isCodeBlockDialogOpen, setIsCodeBlockDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const [backgroundColorState, setBackgroundColorState] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [isTextAlignOpen, setIsTextAlignOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
        paragraph: {
          HTMLAttributes: {
            style: null,
          },
        },
        heading: {
          HTMLAttributes: {
            style: null,
          },
        },
      }),
      CustomCodeBlock,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline cursor-pointer',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
        includeChildren: true,
        considerAnyAsEmpty: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Typography,
      CustomTextStyle,
      Color.configure({ types: [CustomTextStyle.name] }),
      // New extensions
      TextHighlight.configure({
        multicolor: true,
      }),
      TextSubscript,
      TextSuperscript,
      StyleExtension,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-4 sm:p-6',
      },
    },
  });

  const setHeading = useCallback((level: number) => {
    if (level === 0) {
      editor?.chain().focus().setParagraph().run();
    } else {
      editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
    }
  }, [editor]);

  const setFontFamily = useCallback((fontFamily: string) => {
    if (fontFamily === 'default') {
      const currentAttrs = editor?.getAttributes('textStyle') || {};
      const { fontFamily: _, ...otherAttrs } = currentAttrs;
      if (Object.keys(otherAttrs).length > 0) {
        editor?.chain().focus().setMark('textStyle', otherAttrs).run();
      } else {
        editor?.chain().focus().unsetMark('textStyle').run();
      }
    } else {
      // Get current attributes
      const currentAttrs = editor?.getAttributes('textStyle') || {};
      // Set font family while preserving other attributes
      editor?.chain().focus().setMark('textStyle', { 
        ...currentAttrs, 
        fontFamily 
      }).run();
    }
  }, [editor]);

  const setFontSize = useCallback((fontSize: string) => {
    if (fontSize === 'default') {
      const currentAttrs = editor?.getAttributes('textStyle') || {};
      const { fontSize: _, ...otherAttrs } = currentAttrs;
      if (Object.keys(otherAttrs).length > 0) {
        editor?.chain().focus().setMark('textStyle', otherAttrs).run();
      } else {
        editor?.chain().focus().unsetMark('textStyle').run();
      }
    } else {
      // Get current attributes
      const currentAttrs = editor?.getAttributes('textStyle') || {};
      // Set font size while preserving other attributes
      editor?.chain().focus().setMark('textStyle', { 
        ...currentAttrs, 
        fontSize 
      }).run();
    }
  }, [editor]);


  const addImage = useCallback(() => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl('');
      setImageAlt('');
      setIsImageDialogOpen(false);
    }
  }, [editor, imageUrl, imageAlt]);

  const addImageFromFile = useCallback((file: File) => {
    readFile(file).then((base64) => {
      editor?.chain().focus().setImage({ src: base64, alt: file.name }).run();
      setIsImageDialogOpen(false);
    });
  }, [editor]);

  const addLink = useCallback(() => {
    if (linkUrl) {
      if (linkText) {
        // Insert new link with text
        editor?.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        // Apply link to selection
        editor?.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl('');
      setLinkText('');
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl, linkText]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  const addCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock({ language: selectedLanguage }).run();
    setIsCodeBlockDialogOpen(false);
  }, [editor, selectedLanguage]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  const addColumnBefore = useCallback(() => {
    editor?.chain().focus().addColumnBefore().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    editor?.chain().focus().deleteColumn().run();
  }, [editor]);

  const addRowBefore = useCallback(() => {
    editor?.chain().focus().addRowBefore().run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    editor?.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    editor?.chain().focus().deleteRow().run();
  }, [editor]);

  // Helper functions for new features
  const setBackgroundColor = useCallback((color: string) => {
    editor?.chain().focus().setMark('textStyle', { backgroundColor: color }).run();
  }, [editor]);

  const removeBackgroundColor = useCallback(() => {
    editor?.chain().focus().setMark('textStyle', { backgroundColor: null }).run();
  }, [editor]);

  const setLineHeightValue = useCallback((height: number) => {
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const tr = editor?.state.tr;
    
    if (tr && editor) {
      tr.doc.nodesBetween(from, to, (node, pos) => {
        if (['paragraph', 'heading'].includes(node.type.name)) {
          const currentStyle = node.attrs.style || '';
          const newStyle = currentStyle.replace(/line-height:\s*[^;]+;?/g, '').trim();
          const finalStyle = newStyle ? `${newStyle}; line-height: ${height}` : `line-height: ${height}`;
          
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            style: finalStyle,
          });
        }
      });
      editor.view.dispatch(tr);
    }
  }, [editor]);

  const increaseIndentValue = useCallback(() => {
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const tr = editor?.state.tr;
    
    if (tr && editor) {
      tr.doc.nodesBetween(from, to, (node, pos) => {
        if (['paragraph', 'heading'].includes(node.type.name)) {
          const currentIndent = node.attrs.indent || 0;
          if (currentIndent < 8) {
            const currentStyle = node.attrs.style || '';
            const newStyle = currentStyle.replace(/text-indent:\s*[^;]+;?/g, '').trim();
            const finalStyle = newStyle ? `${newStyle}; text-indent: ${(currentIndent + 1) * 40}px` : `text-indent: ${(currentIndent + 1) * 40}px`;
            
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style: finalStyle,
              indent: currentIndent + 1,
            });
          }
        }
      });
      editor.view.dispatch(tr);
    }
  }, [editor]);

  const decreaseIndentValue = useCallback(() => {
    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const tr = editor?.state.tr;
    
    if (tr && editor) {
      tr.doc.nodesBetween(from, to, (node, pos) => {
        if (['paragraph', 'heading'].includes(node.type.name)) {
          const currentIndent = node.attrs.indent || 0;
          if (currentIndent > 0) {
            const currentStyle = node.attrs.style || '';
            const newStyle = currentStyle.replace(/text-indent:\s*[^;]+;?/g, '').trim();
            const finalStyle = currentIndent === 1 ? newStyle : 
              (newStyle ? `${newStyle}; text-indent: ${(currentIndent - 1) * 40}px` : `text-indent: ${(currentIndent - 1) * 40}px`);
            
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style: finalStyle || null,
              indent: currentIndent - 1,
            });
          }
        }
      });
      editor.view.dispatch(tr);
    }
  }, [editor]);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'bash', label: 'Bash' },
    { value: 'json', label: 'JSON' },
    { value: 'php', label: 'PHP' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'sql', label: 'SQL' },
    { value: 'mql5', label: 'MQL5' },
  ];

  const fontFamilies = [
    { value: 'default', label: 'Inter' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Helvetica, sans-serif', label: 'Helvetica' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
  ];

  const fontSizes = [
    { value: 'default', label: '16' },
    { value: '12px', label: '12' },
    { value: '14px', label: '14' },
    { value: '16px', label: '16' },
    { value: '18px', label: '18' },
    { value: '20px', label: '20' },
    { value: '24px', label: '24' },
    { value: '28px', label: '28' },
    { value: '32px', label: '32' },
    { value: '36px', label: '36' },
    { value: '48px', label: '48' },
  ];

  if (!editor) {
    return null;
  }

  const TextAlignControl = ({ editor }: { editor: any }) => {
    if (!editor) {
      return null;
    }
  }
  
    // Xác định icon hiện tại dựa trên căn chỉnh đang hoạt động
    const getCurrentAlignIcon = () => {
      if (editor.isActive({ textAlign: 'left' })) {
        return <FormatAlignLeft className="h-4 w-4" />;
      }
      if (editor.isActive({ textAlign: 'center' })) {
        return <FormatAlignCenter className="h-4 w-4" />;
      }
      if (editor.isActive({ textAlign: 'right' })) {
        return <FormatAlignRight className="h-4 w-4" />;
      }
      if (editor.isActive({ textAlign: 'justify' })) {
        return <FormatAlignJustify className="h-4 w-4" />;
      }
      // Mặc định nếu không có căn chỉnh nào được chọn (có thể là căn trái)
      return <FormatAlignLeft className="h-4 w-4" />;
    };
  
    const getCurrentAlignTooltip = () => {
      if (editor.isActive({ textAlign: 'left' })) {
        return "Căn trái";
      }
      if (editor.isActive({ textAlign: 'center' })) {
        return "Căn giữa";
      }
      if (editor.isActive({ textAlign: 'right' })) {
        return "Căn phải";
      }
      if (editor.isActive({ textAlign: 'justify' })) {
        return "Căn đều";
      }
      return "Căn chỉnh";
    };

  return (
    <TooltipProvider>
      <div className={`border rounded-lg overflow-hidden relative ${className}`}>
        {/* Toolbar */}
        <div className="sticky top-0 z-20 border-b bg-gray-50 dark:bg-gray-800 p-2 shadow-sm backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
          {/* First row - Typography controls */}
          {type === 'post' && (
           <div className="flex flex-wrap gap-1 items-center mb-2">
            {/* Heading Selector */}
            <Select
              value={
                editor.isActive('heading', { level: 1 }) ? '1' :
                editor.isActive('heading', { level: 2 }) ? '2' :
                editor.isActive('heading', { level: 3 }) ? '3' :
                editor.isActive('heading', { level: 4 }) ? '4' :
                editor.isActive('heading', { level: 5 }) ? '5' :
                editor.isActive('heading', { level: 6 }) ? '6' : '0'
              }
              onValueChange={(value) => setHeading(parseInt(value))}
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Văn bản</SelectItem>
                <SelectItem value="1">Tiêu đề 1</SelectItem>
                <SelectItem value="2">Tiêu đề 2</SelectItem>
                <SelectItem value="3">Tiêu đề 3</SelectItem>
                <SelectItem value="4">Tiêu đề 4</SelectItem>
                <SelectItem value="5">Tiêu đề 5</SelectItem>
                <SelectItem value="6">Tiêu đề 6</SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* Font Family */}
            <Select
              value="default"
              onValueChange={setFontFamily}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Size */}
            <Select
              value="default"
              onValueChange={setFontSize}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue placeholder="Cỡ chữ" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Line Height Control */}
            <Select
              value={String(editor.getAttributes('paragraph').lineHeight || 1.5)}
              onValueChange={(value) => {
                const height = parseFloat(value);
                setLineHeight(height);
                setLineHeightValue(height);
              }}
            >
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue placeholder="1.5" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.0">1.0</SelectItem>
                <SelectItem value="1.15">1.15</SelectItem>
                <SelectItem value="1.5">1.5</SelectItem>
                <SelectItem value="2.0">2.0</SelectItem>
                <SelectItem value="2.5">2.5</SelectItem>
                <SelectItem value="3.0">3.0</SelectItem>
              </SelectContent>
            </Select>
          </div> 
          )}

          

          {/* Second row - Formatting controls */}
          <div className="flex flex-wrap gap-1 items-center">
            {/* Text Formatting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('bold') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className="h-8 w-8 p-0"
                >
                  <FormatBold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Đậm (Ctrl+B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('italic') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className="h-8 w-8 p-0"
                >
                  <FormatItalic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Nghiêng (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('underline') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className="h-8 w-8 p-0"
                >
                  <FormatUnderlined className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gạch chân (Ctrl+U)</TooltipContent>
            </Tooltip>

            {/* Subscript/Superscript */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('subscript') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (editor.isActive('superscript')) {
                      editor.chain().focus().unsetSuperscript().run();
                    }
                    editor.chain().focus().toggleSubscript().run();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Subscript className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉ số dưới (Ctrl+,)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('superscript') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    if (editor.isActive('subscript')) {
                      editor.chain().focus().unsetSubscript().run();
                    }
                    editor.chain().focus().toggleSuperscript().run();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Superscript className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉ số trên (Ctrl+Shift+=)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Text Alignment - Hidden on mobile */}
            <TooltipProvider>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger type="button">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label={getCurrentAlignTooltip()}
                        onClick={() => setIsTextAlignOpen(!isTextAlignOpen)}
                      >
                        {getCurrentAlignIcon()}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    {getCurrentAlignTooltip()}
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="start" className={`flex-col gap-1 p-1 absolute ${isTextAlignOpen ? 'visible' : 'invisible'}`}> {/* Có thể điều chỉnh align */}
                  <DropdownMenuItem
                    onClick={() => {
                      editor.chain().focus().setTextAlign('left').run();
                      setIsTextAlignOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    <FormatAlignLeft className="h-4 w-4" /> Căn trái
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      editor.chain().focus().setTextAlign('center').run();
                      setIsTextAlignOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    <FormatAlignCenter className="h-4 w-4" /> Căn giữa
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      editor.chain().focus().setTextAlign('right').run();
                      setIsTextAlignOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    <FormatAlignRight className="h-4 w-4" /> Căn phải
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      editor.chain().focus().setTextAlign('justify').run();
                      setIsTextAlignOpen(false);
                    }}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-gray-100"
                  >
                    <FormatAlignJustify className="h-4 w-4" /> Căn đều
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>


            {/* <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className="h-8 w-8 p-0"
                  >
                    <FormatAlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn trái</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className="h-8 w-8 p-0"
                  >
                    <FormatAlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn giữa</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className="h-8 w-8 p-0"
                  >
                    <FormatAlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn phải</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor.isActive({ textAlign: 'justify' }) ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className="h-8 w-8 p-0"
                  >
                    <FormatAlignJustify className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Căn đều</TooltipContent>
              </Tooltip>
            </div> */}

            <Separator orientation="vertical" className="h-6" />

            {/* Background Color */}
            <Tooltip>
              <TooltipTrigger asChild>
                <ColorPicker
                  colors={['#ffffff', '#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#607d8b']}
                  selectedColor={editor.getAttributes('textStyle').backgroundColor}
                  onColorSelect={(color) => {
                    setBackgroundColorState(color);
                    setBackgroundColor(color);
                  }}
                  onRemoveColor={() => removeBackgroundColor()}
                  title="Màu nền văn bản"
                  icon={<Palette className="h-4 w-4" />}
                />
              </TooltipTrigger>
              <TooltipContent>Màu nền văn bản</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className="h-8 w-8 p-0"
                >
                  <FormatListBulleted className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Danh sách dấu đầu dòng</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className="h-8 w-8 p-0"
                >
                  <FormatListNumbered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Danh sách có số</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Table Controls */}
            {type === 'post' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={editor.isActive('table') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={insertTable}
                    className="h-8 w-8 p-0"
                  >
                    <TableChart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm bảng</TooltipContent>
              </Tooltip>
            )}
            {editor.isActive('table') && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addColumnBefore}
                  className="h-8 text-xs px-2"
                >
                  +Cột trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addColumnAfter}
                  className="h-8 text-xs px-2"
                >
                  +Cột sau
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteColumn}
                  className="h-8 text-xs px-2"
                >
                  -Cột
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRowBefore}
                  className="h-8 text-xs px-2"
                >
                  +Hàng trước
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addRowAfter}
                  className="h-8 text-xs px-2"
                >
                  +Hàng sau
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteRow}
                  className="h-8 text-xs px-2"
                >
                  -Hàng
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteTable}
                  className="h-8 text-xs px-2"
                >
                  Xóa bảng
                </Button>
              </>
            )}

            <Separator orientation="vertical" className="h-6" />

            {/* Code Block */}
            <Dialog open={isCodeBlockDialogOpen} onOpenChange={setIsCodeBlockDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Code block</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm Code Block</DialogTitle>
                  <DialogDescription>
                    Chọn ngôn ngữ cho code block
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Ngôn ngữ</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn ngôn ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCodeBlockDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={addCodeBlock}>
                    Thêm Code Block
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Separator orientation="vertical" className="h-6" />

            {/* Image */}
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Thêm hình ảnh</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm hình ảnh</DialogTitle>
                  <DialogDescription>
                    Thêm hình ảnh từ URL hoặc tải lên từ máy tính
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>URL hình ảnh</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Alt text</Label>
                    <Input
                      placeholder="Mô tả hình ảnh"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Hoặc tải lên từ máy tính</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) addImageFromFile(file);
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={addImage} disabled={!imageUrl}>
                    Thêm hình ảnh
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Link */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DialogTrigger asChild>
                    <Button
                      variant={editor.isActive('link') ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>Thêm liên kết</TooltipContent>
              </Tooltip>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Thêm liên kết</DialogTitle>
                  <DialogDescription>
                    Thêm liên kết cho văn bản đã chọn hoặc tạo liên kết mới
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Văn bản hiển thị (tùy chọn)</Label>
                    <Input
                      placeholder="Văn bản liên kết"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                    Hủy
                  </Button>
                  {editor.isActive('link') && (
                    <Button variant="destructive" onClick={removeLink}>
                      Xóa liên kết
                    </Button>
                  )}
                  <Button onClick={addLink} disabled={!linkUrl}>
                    Thêm liên kết
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Separator orientation="vertical" className="h-6" />

            

            {/* Indent Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant="ghost"
                  size="sm"
                  onClick={() => decreaseIndentValue()}
                  className="h-8 w-8 p-0"
                >
                  <IndentDecrease className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Giảm thụt đầu dòng (Shift+Tab)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant="ghost"
                  size="sm"
                  onClick={() => increaseIndentValue()}
                  className="h-8 w-8 p-0"
                >
                  <IndentIncrease className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tăng thụt đầu dòng (Tab)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            {/* Undo/Redo */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8 p-0"
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hoàn tác (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type='button'
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-8 w-8 p-0"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Làm lại (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor Content */}
        <div className="bg-white dark:bg-gray-900 overflow-y-auto max-h-[calc(100vh-200px)]">
          <EditorContent 
            editor={editor} 
            className="min-h-[400px] focus-within:outline-none"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TiptapEditor;