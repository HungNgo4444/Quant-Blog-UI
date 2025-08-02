'use client';

import React, { useState, useEffect } from 'react';
import { getCommunityUsers } from '../../../services/UserService';
import UserCard from '../../../components/QA/UserCard';
import SortingControls, { SortOption } from '../../../components/QA/SortingControls';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import { Users, Star, MessageSquare, HelpCircle } from 'lucide-react';

interface CommunityUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  questionCount: number;
  answerCount: number;
  reputation: number;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<CommunityUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('reputation' as SortOption);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getCommunityUsers({
        page,
        limit: 12,
        sort: sortBy as 'newest' | 'reputation' | 'most_questions' | 'most_answers',
        search: searchTerm,
      });
      
      setUsers(response.users || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setCurrentPage(response.pagination?.currentPage || 1);
      setTotalUsers(response.pagination?.totalItems || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Có lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, [sortBy, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  const userSortOptions = [
    { value: 'reputation' as SortOption, label: 'Uy tín cao nhất' },
    { value: 'newest' as SortOption, label: 'Thành viên mới' },
    { value: 'most_questions' as SortOption, label: 'Nhiều câu hỏi nhất' },
    { value: 'most_answers' as SortOption, label: 'Nhiều câu trả lời nhất' },
  ];

  const UserSkeleton = () => (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thành viên cộng đồng</h1>
          <p className="text-gray-600">
            Khám phá {totalUsers.toLocaleString()} thành viên đang đóng góp cho cộng đồng
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <div className="text-sm opacity-90">Thành viên</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.answerCount, 0).toLocaleString()}
              </div>
              <div className="text-sm opacity-90">Câu trả lời</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 text-center">
              <HelpCircle className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.questionCount, 0).toLocaleString()}
              </div>
              <div className="text-sm opacity-90">Câu hỏi</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {users.reduce((sum, user) => sum + user.reputation, 0).toLocaleString()}
              </div>
              <div className="text-sm opacity-90">Tổng uy tín</div>
            </CardContent>
          </Card>
        </div>

        <SortingControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm kiếm thành viên..."
          customSortOptions={userSortOptions}
        />

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <UserSkeleton key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Không tìm thấy thành viên nào' : 'Chưa có thành viên'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc.'
                    : 'Cộng đồng chưa có thành viên nào.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {users.length > 0 && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Star className="h-5 w-5" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {users.find(u => u.reputation === Math.max(...users.map(u => u.reputation)))?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-indigo-600">Uy tín cao nhất</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {users.find(u => u.answerCount === Math.max(...users.map(u => u.answerCount)))?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-indigo-600">Nhiều câu trả lời nhất</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-700">
                      {users.find(u => u.questionCount === Math.max(...users.map(u => u.questionCount)))?.name || 'N/A'}
                    </div>
                    <div className="text-sm text-indigo-600">Nhiều câu hỏi nhất</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Về cộng đồng</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cộng đồng được xếp hạng dựa trên đóng góp và uy tín</li>
            <li>• Thành viên có uy tín cao thường có câu trả lời chất lượng</li>
            <li>• Hãy tương tác và học hỏi từ những thành viên kinh nghiệm</li>
          </ul>
        </div>
      </div>
    </div>
  );
}