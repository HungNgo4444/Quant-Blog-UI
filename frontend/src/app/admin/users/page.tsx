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
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
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
import { PlusCircle, Pencil, Trash2, Mail, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { adminDeleteUser, adminRestoreUser, getAdminUsers } from "../../../services/UserService";
import { Dialog, DialogHeader, DialogContent, DialogFooter, DialogTitle, DialogDescription } from "../../../components/ui/dialog";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("true");
  const [roleFilter, setRoleFilter] = useState("all");
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [restoringUser, setRestoringUser] = useState<any>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async (page: number = 1, search: string = "", active: string = "true", role: string = "all") => {
    try {
      setLoading(true);
      const res = await getAdminUsers(page, 7, search, active, role);
      setUsers(res.users || []);
      setPagination(res.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 7
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Fetch users when page or debouncedSearchTerm changes
  useEffect(() => {
    fetchUsers(currentPage, debouncedSearchTerm, activeFilter, roleFilter);
  }, [currentPage, debouncedSearchTerm]);

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-black text-white";
      case "editor":
        return "bg-blue-500";
      case "author":
        return "bg-green-500";
      default:
        return "bg-black text-white";
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "editor":
        return "Biên tập viên";
      case "author":
        return "Tác giả";
      case "user":
        return "Người dùng";
      default:
        return role;
    }
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    try {
      const result = await adminDeleteUser(deletingUser.user_id);
      if (result) {
        toast.success('Vô hiệu hóa người dùng thành công');
        fetchUsers(currentPage, debouncedSearchTerm);
        setDeleteDialogOpen(false);
        setDeletingUser(null);
      } else {
        toast.error('Vô hiệu hóa người dùng thất bại');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Vô hiệu hóa người dùng thất bại');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteUser = (user: any) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const handleRestoreUser = (user: any) => {
    setRestoringUser(user);
    setRestoreDialogOpen(true);
  };

  const confirmRestore = async () => {
    if (!restoringUser) return;

    setRestoreLoading(true);
    try {
      const result = await adminRestoreUser(restoringUser.user_id);
      if (result) {
        toast.success('Khôi phục người dùng thành công');
        fetchUsers(currentPage, debouncedSearchTerm, activeFilter, roleFilter);
        setRestoreDialogOpen(false);
        setRestoringUser(null);
      } else {
        toast.error('Khôi phục người dùng thất bại');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Khôi phục người dùng thất bại');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Người dùng</h2>
        {/* <Button onClick={() => {}} className="bg-gray-900 hover:bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900">
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button> */}
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={activeFilter}
          onValueChange={(value) => {
            setActiveFilter(value);
            fetchUsers(currentPage, debouncedSearchTerm, value, roleFilter);
          }}
        >
          <SelectTrigger className="w-[150px] ml-4">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Hoạt động</SelectItem>
            <SelectItem value="false">Đã vô hiệu hóa</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value);
            fetchUsers(currentPage, debouncedSearchTerm, activeFilter, value);
          }}
        >
          <SelectTrigger className="w-[150px] mr-auto ml-4">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="admin">Quản trị viên</SelectItem>
            <SelectItem value="user">Người dùng</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Pagination Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400 pl-4">
          Hiển thị {users.length} trong tổng số {pagination.totalItems} người dùng
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
              <TableHead className="py-4">Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Số bài viết</TableHead>
              <TableHead>Ngày tham gia</TableHead>
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
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user: any) => (
                <TableRow key={user.user_id}>
                  <TableCell className="py-5">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user.user_avatar} alt={user.user_name} />
                        <AvatarFallback>{getInitials(user.user_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.user_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.user_email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getRoleBadgeColor(user.user_role)}>
                      {getRoleText(user.user_role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.post_count}</TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="mr-2">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {activeFilter === "true" ? (
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteUser(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleRestoreUser(user)}>
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận vô hiệu hóa người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn vô hiệu hóa người dùng "<strong>{deletingUser?.user_name}</strong>"?
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
              {deleteLoading ? "Đang xử lý..." : "Vô hiệu hóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận khôi phục người dùng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khôi phục người dùng "<strong>{restoringUser?.user_name}</strong>"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRestoreDialogOpen(false)}
              disabled={restoreLoading}
            >
              Hủy
            </Button>
            <Button 
              variant="default" 
              onClick={confirmRestore}
              disabled={restoreLoading}
              className="bg-green-500 hover:bg-green-600 text-gray-700"
            >
              {restoreLoading ? "Đang xử lý..." : "Khôi phục"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 