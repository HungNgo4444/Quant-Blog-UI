'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User, MessageCircle, AlertCircle } from 'lucide-react';
import { Question, Answer } from '../../../types/qa.types';
import { getQuestion, getAnswers, createAnswer } from '../../../services/QAService';
import VoteButton from '../../../components/QA/VoteButton';
import AnswerItem from '../../../components/QA/AnswerItem';
import AnswerForm from '../../../components/QA/AnswerForm';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toVietnamTime } from '../../../lib/timezone';
import AnswerList from "../../../components/QA/AnswerList";

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = params?.id as string;
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const fetchQuestion = useCallback(async () => {
      try {
        setLoading(true);
        const response = await getQuestion(questionId);
        setQuestion(response.data);
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Không thể tải câu hỏi');
      } finally {
        setLoading(false);
      }
  }, [questionId]);

  const handleAnswerSubmit = async (content: string) => {
    try {
      setIsSubmittingAnswer(true);
      await createAnswer(questionId, { content });
      await fetchQuestion(); // Refresh to update answer count
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Có lỗi xảy ra khi gửi câu trả lời');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  useEffect(() => {
    if (questionId) {
      fetchQuestion();
    }
  }, [questionId, fetchQuestion]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Không tìm thấy câu hỏi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'Câu hỏi bạn tìm kiếm không tồn tại hoặc đã bị xóa'}
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(toVietnamTime(question.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách câu hỏi
          </button>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
          <div className="flex gap-6">
            {/* Vote Section */}
            <div className="flex-shrink-0">
              <VoteButton
                targetId={question.id}
                targetType="question"
                upvoteCount={question.upvote_count}
                downvoteCount={question.downvote_count}
                userVoteStatus={question.userVoteStatus}
                size="lg"
              />
            </div>

            {/* Content Section */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {question.title}
              </h1>

              <div 
                className="prose prose-gray dark:prose-invert max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: question.content }}
              />

              {/* Question Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{question.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{timeAgo}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{question.answer_count ?? 0} câu trả lời</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <AnswerList questionId={questionId} questionAnswerCount={question?.answer_count}/>

        {/* Answer Form */}
        <AnswerForm
          questionId={questionId}
          onSubmit={handleAnswerSubmit}
          isSubmitting={isSubmittingAnswer}
        />
      </div>
    </div>
  );
}