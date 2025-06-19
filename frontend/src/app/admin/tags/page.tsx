'use client';

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getAdminTags, adminDeleteTag } from "../../../services/TagService";
import TagDialog from "../../../components/admin/tags/TagDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-toastify";

export default function TagsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTag, setDeletingTag] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTags = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const res = await getAdminTags(page, 7, search);
      setTags(res.tags || []);
      setPagination(res.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 7
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch tags when page or debouncedSearchTerm changes
  useEffect(() => {
    fetchTags(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  const handleAddTag = () => {
    setEditingTag(null);
    setDialogOpen(true);
  };

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchTags(currentPage, debouncedSearchTerm);
  };

  const handleDeleteTag = (tag: any) => {
    setDeletingTag(tag);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTag) return;

    setDeleteLoading(true);
    try {
      const result = await adminDeleteTag(deletingTag.tag_id);
      if (result) {
        toast.success('Xóa thẻ thành công');
        fetchTags(currentPage, debouncedSearchTerm);
        setDeleteDialogOpen(false);
        setDeletingTag(null);
      } else {
        toast.error('Xóa thẻ thất bại');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Xóa thẻ thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Thẻ</h2>
        <Button 
          onClick={handleAddTag}
          className="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm thẻ
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Tìm kiếm thẻ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {tags.length} trong tổng số {pagination.totalItems} thẻ
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
              <TableHead className="py-4">Tên thẻ</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Số bài viết</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    <span className="ml-2">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Không tìm thấy thẻ nào
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag: any) => (
                <TableRow key={tag.tag_id}>
                  <TableCell className="py-5">
                    <Badge variant="secondary" className="bg-black text-white">
                      {tag.tag_name}
                    </Badge>
                  </TableCell>
                  <TableCell>{tag.tag_description}</TableCell>
                  <TableCell>{tag.tag_slug}</TableCell>
                  <TableCell>{tag.post_count}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="mr-2"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => handleDeleteTag(tag)}
                    >
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

      <TagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tag={editingTag}
        onSuccess={handleDialogSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thẻ</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa thẻ "<strong>{deletingTag?.tag_name}</strong>"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 