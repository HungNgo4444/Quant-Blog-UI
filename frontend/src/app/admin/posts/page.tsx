'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Public,
  ArticleOutlined as Draft,
  Schedule,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import Link from 'next/link';
import { formatDate } from '../../../lib/utils';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  category: {
    id: string;
    name: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: Array<{
    id: string;
    name: string;
  }>;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockPosts: Post[] = [
        {
          id: '1',
          title: 'Hướng dẫn sử dụng TypeScript hiệu quả',
          slug: 'huong-dan-su-dung-typescript-hieu-qua',
          status: 'published',
          category: { id: '1', name: 'Technology' },
          author: { id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' },
          tags: [
            { id: '1', name: 'TypeScript' },
            { id: '2', name: 'Programming' }
          ],
          views: 1234,
          likes: 89,
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
          publishedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          title: 'React Server Components: Tương lai của React',
          slug: 'react-server-components-tuong-lai-cua-react',
          status: 'draft',
          category: { id: '2', name: 'Tutorial' },
          author: { id: '2', name: 'Jane Smith', avatar: '/avatars/jane.jpg' },
          tags: [
            { id: '3', name: 'React' },
            { id: '4', name: 'Frontend' }
          ],
          views: 0,
          likes: 0,
          createdAt: '2024-01-14T09:00:00Z',
          updatedAt: '2024-01-14T09:00:00Z',
        },
        {
          id: '3',
          title: 'NestJS vs Express: So sánh chi tiết',
          slug: 'nestjs-vs-express-so-sanh-chi-tiet',
          status: 'scheduled',
          category: { id: '1', name: 'Technology' },
          author: { id: '3', name: 'Bob Wilson', avatar: '/avatars/bob.jpg' },
          tags: [
            { id: '5', name: 'NestJS' },
            { id: '6', name: 'Express' },
            { id: '7', name: 'Backend' }
          ],
          views: 0,
          likes: 0,
          createdAt: '2024-01-13T08:00:00Z',
          updatedAt: '2024-01-13T08:00:00Z',
          publishedAt: '2024-01-20T10:00:00Z',
        },
      ];

      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const mockCategories: Category[] = [
        { id: '1', name: 'Technology', slug: 'technology' },
        { id: '2', name: 'Tutorial', slug: 'tutorial' },
        { id: '3', name: 'News', slug: 'news' },
        { id: '4', name: 'Review', slug: 'review' },
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      // API call to delete post
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      // API call to update post status
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, status: newStatus as 'published' | 'draft' | 'scheduled' }
          : post
      ));
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <Public sx={{ fontSize: 16 }} />;
      case 'draft':
        return <Draft sx={{ fontSize: 16 }} />;
      case 'scheduled':
        return <Schedule sx={{ fontSize: 16 }} />;
      default:
        return <Draft sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warning';
      case 'scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category.id === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Tiêu đề',
      flex: 1,
      minWidth: 300,
      renderCell: (params) => (
        <Box>
          <Typography variant="subtitle2" className="font-medium line-clamp-2">
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.author.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 140,
      renderCell: (params) => (
        <Chip
          icon={getStatusIcon(params.row.status)}
          label={
            params.row.status === 'published' ? 'Xuất bản' :
            params.row.status === 'draft' ? 'Nháp' : 'Đã lên lịch'
          }
          size="small"
          color={getStatusColor(params.row.status)}
        />
      ),
    },
    {
      field: 'category',
      headerName: 'Danh mục',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.category.name}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'tags',
      headerName: 'Thẻ',
      width: 200,
      renderCell: (params) => (
        <Box className="flex flex-wrap gap-1">
          {params.row.tags.slice(0, 2).map((tag: any) => (
            <Chip
              key={tag.id}
              label={tag.name}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          ))}
          {params.row.tags.length > 2 && (
            <Chip
              label={`+${params.row.tags.length - 2}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', height: 20 }}
            />
          )}
        </Box>
      ),
    },
    {
      field: 'stats',
      headerName: 'Thống kê',
      width: 120,
      renderCell: (params) => (
        <Box>
          <Box className="flex items-center">
            <Visibility sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption">{params.row.views}</Typography>
          </Box>
          <Box className="flex items-center">
            <Typography variant="caption" color="primary">♥ {params.row.likes}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Ngày tạo',
      width: 120,
      renderCell: (params) => (
        <Typography variant="caption" color="text.secondary">
          {formatDate(params.row.createdAt)}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              component={Link}
              href={`/admin/posts/edit/${params.row.id}`}
            >
              <Edit sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Xem trước">
            <IconButton
              size="small"
              component={Link}
              href={`/posts/${params.row.slug}`}
              target="_blank"
            >
              <Visibility sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Thêm">
            <IconButton
              size="small"
              onClick={(e) => {
                setSelectedPost(params.row);
                setActionMenuAnchor(e.currentTarget);
              }}
            >
              <MoreVert sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box className="flex items-center justify-between mb-6">
        <Typography variant="h4" component="h1" className="font-bold">
          Quản lý Bài viết
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          href="/admin/posts/create"
          size="large"
        >
          Tạo bài viết mới
        </Button>
      </Box>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <Box className="flex flex-col md:flex-row gap-4">
            <TextField
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="published">Đã xuất bản</MenuItem>
                <MenuItem value="draft">Bản nháp</MenuItem>
                <MenuItem value="scheduled">Đã lên lịch</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={categoryFilter}
                label="Danh mục"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Posts DataGrid */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={filteredPosts}
            columns={columns}
            loading={loading}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 },
              },
            }}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'grey.50',
                borderBottom: '2px solid',
                borderColor: 'divider',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            if (selectedPost) {
              handleStatusChange(selectedPost.id, 'published');
            }
            setActionMenuAnchor(null);
          }}
          disabled={selectedPost?.status === 'published'}
        >
          <Public className="mr-2" />
          Xuất bản
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedPost) {
              handleStatusChange(selectedPost.id, 'draft');
            }
            setActionMenuAnchor(null);
          }}
          disabled={selectedPost?.status === 'draft'}
        >
          <Draft className="mr-2" />
          Chuyển thành nháp
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            setActionMenuAnchor(null);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete className="mr-2" />
          Xóa bài viết
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <>
              <Alert severity="warning" className="mb-4">
                Hành động này không thể hoàn tác!
              </Alert>
              <Typography>
                Bạn có chắc chắn muốn xóa bài viết <strong>"{selectedPost.title}"</strong>?
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={() => selectedPost && handleDeletePost(selectedPost.id)}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 