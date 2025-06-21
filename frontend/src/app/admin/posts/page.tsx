'use client';

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../../components/ui/pagination";
import { PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { deletePost, getAdminPosts } from "../../../services/PostService";
import { useRouter } from "next/navigation";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { toast } from "react-toastify";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [slug, setSlug] = useState("");
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPosts = async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      const res = await getAdminPosts(page, 7, status, search);
      setPosts(res.posts || []);
      setPagination(res.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 7
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Fetch posts when page, debouncedSearchTerm, or statusFilter changes
  useEffect(() => {
    fetchPosts(currentPage, debouncedSearchTerm, statusFilter);
  }, [currentPage, debouncedSearchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "review":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Đã xuất bản";
      case "draft":
        return "Bản nháp";
      case "review":
        return "Đang duyệt";
      default:
        return status;
    }
  };

  const handleDeletePost = async (slug: string) => {
    try {
      const res = await deletePost(slug);
      if (res.message === 'Post deleted successfully') {
        toast.success('Bài viết đã được xóa thành công');
        setPosts(posts.filter((post: any) => post.slug !== slug));
      } else {
        toast.error('Lỗi khi xóa bài viết');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Bài viết</h2>
        <Button onClick={() => router.push('/posts/create')} className="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900">
          <PlusCircle className="mr-2 h-4 w-4" />
          Bài viết mới
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="review">Đang duyệt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {posts.length} trong tổng số {pagination.totalItems} bài viết
          {pagination.totalPages > 1 && (
            <span className="ml-2">
              (Trang {pagination.currentPage} / {pagination.totalPages})
            </span>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-4">Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Không tìm thấy bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post:any) => (
                <TableRow key={post.id}>
                  <TableCell className="py-5">{post.title}</TableCell>
                  <TableCell>{post.author?.name || 'N/A'}</TableCell>
                  <TableCell>{post.category?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(post.status)}>
                      {getStatusText(post.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('vi-VN') : 'Chưa xuất bản'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={()=> {setOpenImageDialog(true); setSelectedImageUrl(post.featuredImage)}} variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button onClick={()=> {setOpenDeleteDialog(true); setSlug(post.slug)}} variant="ghost" size="icon" className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 3 && (
                <>
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => setCurrentPage(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                  {currentPage > 4 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {/* Pages around current page */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === currentPage || 
                  page === currentPage - 1 || 
                  page === currentPage + 1 ||
                  (currentPage <= 2 && page <= 3) ||
                  (currentPage >= pagination.totalPages - 1 && page >= pagination.totalPages - 2)
                )
                .map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

              {/* Last page */}
              {currentPage < pagination.totalPages - 2 && (
                <>
                  {currentPage < pagination.totalPages - 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink 
                      onClick={() => setCurrentPage(pagination.totalPages)}
                      className="cursor-pointer"
                    >
                      {pagination.totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => {
                    if (currentPage < pagination.totalPages) {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {openImageDialog && (
        <Dialog open={openImageDialog} onOpenChange={setOpenImageDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ảnh bài viết</DialogTitle>
            </DialogHeader>
            <img src={selectedImageUrl} alt="Ảnh bài viết" className="w-full h-auto" />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài viết</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa bài viết này không?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={()=> {setOpenDeleteDialog(false)}} variant="outline" className="bg-gray-100 text-gray-900">Hủy</Button>
            <Button onClick={()=> {handleDeletePost(slug)}} variant="destructive">Xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 