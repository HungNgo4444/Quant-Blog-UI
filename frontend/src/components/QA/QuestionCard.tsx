'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Calendar, User } from 'lucide-react';
import { Question } from '../../types/qa.types';
import VoteButton from './VoteButton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toVietnamTime } from '../../lib/timezone';

interface QuestionCardProps {
  question: Question;
  onVoteUpdate?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onVoteUpdate }) => {
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Chuyển từ UTC+0 sang UTC+7 (giờ Việt Nam)
  const timeAgo = formatDistanceToNow(toVietnamTime(question.created_at), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButton
            targetId={question.id}
            targetType="question"
            upvoteCount={question.upvote_count}
            downvoteCount={question.downvote_count}
            userVoteStatus={question.userVoteStatus}
            onVoteUpdate={onVoteUpdate}
            size="sm"
          />
        </div>

        {/* Stats Section */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 text-sm text-gray-600 dark:text-gray-400 min-w-[80px]">
          <div className="flex items-center gap-1 mb-1">
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{question.answer_count ?? 0}</span>
          </div>
          <span className="text-xs">câu trả lời</span>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <Link 
            href={`/qa/${question.id}`}
            className="block group"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-2">
              {question.title}
            </h3>
          </Link>

          <div 
            className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: truncateContent(question.content.replace(/<[^>]*>/g, '')) 
            }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{question.user.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
            </div>

            {/* Tags or Categories could go here */}
            <div className="flex gap-2">
              {/* Placeholder for tags */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard; 