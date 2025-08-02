'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Answer } from '../../../types/qa.types';
import { getUserAnswers } from '../../../services/QAService';
import MyAnswerCard from '../../../components/QA/MyAnswerCard';
import SortingControls, { SortOption } from '../../../components/QA/SortingControls';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { MessageSquare, Award } from 'lucide-react';
import Link from 'next/link';

export default function MyAnswersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [answers, setAnswers] = useState<(Answer & { question: { id: string; title: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalAnswers: 0,
    totalUpvotes: 0,
    reputationEarned: 0,
  });

  const fetchMyAnswers = async (page: number = 1) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await getUserAnswers(user.id, {
        page,
        limit: 10,
        sort: sortBy as 'newest' | 'oldest' | 'most_voted',
        search: searchTerm,
      });
      
      setAnswers(response.data);
      setTotalPages(response.pagination.total_pages);
      setCurrentPage(response.pagination.current_page);
      
      const totalUpvotes = response.data.reduce((sum, answer) => sum + answer.upvote_count, 0);
      const totalDownvotes = response.data.reduce((sum, answer) => sum + answer.downvote_count, 0);
      const reputationEarned = totalUpvotes * 10 - totalDownvotes * 2;
      
      setStats({
        totalAnswers: response.pagination.total,
        totalUpvotes,
        reputationEarned,
      });
    } catch (error) {
      console.error('Error fetching my answers:', error);
      alert('Có lỗi khi tải danh sách câu trả lời');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAnswers(1);
  }, [user?.id, sortBy, searchTerm]);

  const handleDeleteAnswer = (answerId: string) => {
    setAnswers(prev => prev.filter(a => a.id !== answerId));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchMyAnswers(page);
  };

  const myAnswerSortOptions = [
    { value: 'newest' as SortOption, label: 'Mới nhất' },
    { value: 'oldest' as SortOption, label: 'Cũ nhất' },
    { value: 'most_voted' as SortOption, label: 'Nhiều vote nhất' },
  ];

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Cần đăng nhập</h3>
            <p className="text-gray-600 mb-4">
              Bạn cần đăng nhập để xem danh sách câu trả lời của mình.
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
            <h1 className="text-3xl font-bold text-gray-900">Câu trả lời của tôi</h1>
            <p className="text-gray-600 mt-2">
              Theo dõi và quản lý các câu trả lời bạn đã đóng góp cho cộng đồng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">{stats.totalAnswers}</div>
              <div className="text-sm text-gray-600">Tổng câu trả lời</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700">{stats.totalUpvotes}</div>
              <div className="text-sm text-gray-600">Lượt upvote</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-700 mb-2">
                +{stats.reputationEarned}
              </div>
              <div className="text-sm text-gray-600">Điểm uy tín kiếm được</div>
            </CardContent>
          </Card>
        </div>

        <SortingControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Tìm kiếm trong câu trả lời của bạn..."
          customSortOptions={myAnswerSortOptions}
        />

        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : answers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? 'Không tìm thấy câu trả lời nào' : 'Chưa có câu trả lời nào'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? 'Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc.'
                    : 'Bạn chưa trả lời câu hỏi nào. Hãy bắt đầu bằng cách giúp đỡ cộng đồng!'
                  }
                </p>
                {!searchTerm && (
                  <Button>
                    <Link href="/community">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Khám phá câu hỏi
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {answers.map((answer) => (
                  <MyAnswerCard
                    key={answer.id}
                    answer={answer}
                    onDelete={handleDeleteAnswer}
                    onUpdate={() => fetchMyAnswers(currentPage)}
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

        {answers.length > 0 && (
          <div className="mt-8 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🌟 Hệ thống điểm uy tín</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Upvote một câu trả lời: <span className="font-semibold">+10 điểm</span></li>
              <li>• Downvote một câu trả lời: <span className="font-semibold">-2 điểm</span></li>
              <li>• Câu trả lời được chấp nhận: <span className="font-semibold">+15 điểm</span></li>
              <li>• Câu trả lời chất lượng sẽ giúp xây dựng uy tín của bạn trong cộng đồng</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}