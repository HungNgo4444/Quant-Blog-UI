'use client';

import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Answer } from '../../types/qa.types';
import VoteButton from './VoteButton';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toVietnamTime } from '../../lib/timezone';

interface AnswerItemProps {
  answer: any;
  onVoteUpdate?: () => void;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, onVoteUpdate }) => {
  const timeAgo = formatDistanceToNow(toVietnamTime(answer.answer_created_at), {
    addSuffix: true,
    locale: vi,
  });



  return (
    <div className="py-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex-shrink-0">
          <VoteButton
            targetId={answer.answer_id}
            targetType="answer"
            upvoteCount={answer.answer_upvote_count}
            downvoteCount={answer.answer_downvote_count}
            userVoteStatus={answer.userVote_vote_type}
            size="sm"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1">
          <div 
            className="prose prose-gray dark:prose-invert max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: answer.answer_content }}
          />

          {/* Answer Footer */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="font-medium">{answer.user_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerItem;