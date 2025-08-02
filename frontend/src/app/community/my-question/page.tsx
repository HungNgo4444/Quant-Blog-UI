'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Question } from '../../../types/qa.types';
import { getQuestions } from '../../../services/QAService';
import MyQuestionCard from '../../../components/QA/MyQuestionCard';
import SortingControls, { SortOption } from '../../../components/QA/SortingControls';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { PlusCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function MyQuestionsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyQuestions = async (page: number = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await getQuestions({
        page,
        limit: 10,
        sort: sortBy as 'newest' | 'oldest' | 'most_voted' | 'most_answered',
        search: searchTerm,
        user_id: user.id,
      });
      
      setQuestions(response.data);
      setTotalPages(response.pagination.total_pages);
      setCurrentPage(response.pagination.current_page);
    } catch (error) {
      console.error('Error fetching my questions:', error);
      alert('Có lỗi khi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuestions(1);
  }, [user?.id, sortBy, searchTerm]);

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMyQuestions(page);
  };

  const myQuestionSortOptions = [
    { value: 'newest' as SortOption, label: 'Mới nhất' },
    { value: 'oldest' as SortOption, label: 'Cũ nhất' },
    { value: 'most_voted' as SortOption, label: 'Nhiều vote nhất' },
    { value: 'most_answered' as SortOption, label: 'Nhiều câu trả lời nhất' },
  ];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cần đăng nhập</h3>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để xem danh sách câu hỏi của mình.
            </p>
            <Button >
              <Link href="/auth/login">Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Câu hỏi của tôi</h1>
            <p className="text-gray-600 mt-2">
              Quản lý và theo dõi các câu hỏi bạn đã đặt trong cộng đồng
            </p>
          </div>
          <Button >
            <Link href="/community?action=ask">
              <PlusCircle className="h-4 w-4 mr-2" />
              Đặt câu hỏi mới
            </Link>
          </Button>
        </div>

        <SortingControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm kiếm trong câu hỏi của bạn..."
          customSortOptions={myQuestionSortOptions}
        />

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Không tìm thấy câu hỏi nào' : 'Chưa có câu hỏi nào'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc.'
                    : 'Bạn chưa đặt câu hỏi nào. Hãy bắt đầu bằng cách đặt câu hỏi đầu tiên!'
                  }
                </p>
                {!searchTerm && (
                  <Button >
                    <Link href="/community?action=ask">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Đặt câu hỏi đầu tiên
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {questions.map((question) => (
                  <MyQuestionCard
                    key={question.id}
                    question={question}
                    onDelete={handleDeleteQuestion}
                    onUpdate={() => fetchMyQuestions(currentPage)}
                  />
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

        {questions.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Mẹo</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Bạn chỉ có thể chỉnh sửa câu hỏi khi chưa có câu trả lời nào</li>
              <li>• Câu hỏi có nhiều vote và câu trả lời thường được ưu tiên hiển thị</li>
              <li>• Hãy cập nhật câu hỏi nếu bạn tìm được giải pháp để giúp người khác</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}