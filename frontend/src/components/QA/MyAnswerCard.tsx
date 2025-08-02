'use client';

import React, { useState } from 'react';
import { Answer } from '../../types/qa.types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { deleteAnswer } from '../../services/QAService';

interface MyAnswerCardProps {
  answer: Answer & { question?: { id: string; title: string } };
  onDelete?: (answerId: string) => void;
  onUpdate?: () => void;
}

export default function MyAnswerCard({ answer, onDelete, onUpdate }: MyAnswerCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa câu trả lời này?')) return;
    
    try {
      setIsDeleting(true);
      await deleteAnswer(answer.id);
      alert('Đã xóa câu trả lời thành công');
      onDelete?.(answer.id);
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa câu trả lời');
    } finally {
      setIsDeleting(false);
    }
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-base text-gray-600 mb-2">
              Câu trả lời cho:
            </CardTitle>
            <Link 
              href={`/community/${answer.question?.id || answer.question_id}`}
              className="text-lg font-semibold hover:text-blue-600 transition-colors block"
            >
              {answer.question?.title || 'Câu hỏi đã bị xóa'}
            </Link>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                alert('Tính năng chỉnh sửa đang được phát triển');
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Chỉnh sửa
            </Button>
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
        <div className="mb-4">
          <div 
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ 
              __html: truncateContent(answer.content) 
            }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span>{answer.upvote_count}</span>
              <ThumbsDown className="h-4 w-4 text-red-600 ml-2" />
              <span>{answer.downvote_count}</span>
            </div>
            <div className="text-xs">
              Điểm: +{answer.upvote_count * 10 - answer.downvote_count * 2}
            </div>
          </div>
          <Badge variant="secondary">
            {format(new Date(answer.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </Badge>
        </div>

        <div className="mt-3 pt-3 border-t">
          <Link 
            href={`/community/${answer.question?.id || answer.question_id}`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Xem câu hỏi và tất cả câu trả lời →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}