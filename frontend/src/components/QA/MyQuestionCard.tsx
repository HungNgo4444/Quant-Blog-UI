'use client';

import React, { useState } from 'react';
import { Question } from '../../types/qa.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MessageSquare, ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { deleteQuestion } from '../../services/QAService';

interface MyQuestionCardProps {
  question: Question;
  onDelete?: (questionId: string) => void;
  onUpdate?: () => void;
}

export default function MyQuestionCard({ question, onDelete, onUpdate }: MyQuestionCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const answerCount = question.answer_count || 0;
    const confirmMessage = answerCount > 0
      ? `Bạn có chắc chắn muốn xóa câu hỏi này? Câu hỏi đã có ${answerCount} câu trả lời.`
      : 'Bạn có chắc chắn muốn xóa câu hỏi này?';
      
    if (!confirm(confirmMessage)) return;
    
    try {
      setIsDeleting(true);
      await deleteQuestion(question.id);
      alert('Đã xóa câu hỏi thành công');
      onDelete?.(question.id);
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa câu hỏi');
    } finally {
      setIsDeleting(false);
    }
  };

  const canEdit = (question.answer_count || 0) === 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">
            <Link 
              href={`/community/${question.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {question.title}
            </Link>
          </CardTitle>
          <div className="flex gap-2 ml-4">
            {canEdit && (
              <Link href={`/community/${question.id}/edit`}>
                <Button
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Chỉnh sửa
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{question.answer_count || 0} câu trả lời</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span>{question.upvote_count}</span>
              <ThumbsDown className="h-4 w-4 text-red-600 ml-2" />
              <span>{question.downvote_count}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {format(new Date(question.created_at), 'dd/MM/yyyy', { locale: vi })}
            </Badge>
            {(question.answer_count || 0) === 0 && (
              <Badge variant="outline" className="text-blue-600">
                Có thể chỉnh sửa
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}