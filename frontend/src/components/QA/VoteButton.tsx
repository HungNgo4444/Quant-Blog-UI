'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { VoteType } from '../../types/qa.types';
// import { toast } from 'react-hot-toast';
import { voteQuestion, voteAnswer } from '../../services/QAService';
import {toast} from "react-toastify";

interface VoteButtonProps {
  targetId: string;
  targetType: 'question' | 'answer';
  upvoteCount: number;
  downvoteCount: number;
  userVoteStatus?: VoteType | null;
  onVoteUpdate?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const VoteButton: React.FC<VoteButtonProps> = ({
  targetId,
  targetType,
  upvoteCount,
  downvoteCount,
  userVoteStatus,
  onVoteUpdate,
  size = 'md',
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [currentUpvotes, setCurrentUpvotes] = useState(upvoteCount);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvoteCount);
  const [currentVoteStatus, setCurrentVoteStatus] = useState(userVoteStatus);

  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleVote = async (voteType: VoteType) => {
    try {
      setIsVoting(true);

      if (targetType === 'question') {
        const res= await voteQuestion(targetId, voteType);
      } else {
        await voteAnswer(targetId, voteType);
      }

      // Update local state based on vote logic
      if (currentVoteStatus === voteType) {
        // Remove vote
        setCurrentVoteStatus(null);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => Math.max(0, prev - 1));
        } else {
          setCurrentDownvotes(prev => Math.max(0, prev - 1));
        }
      } else if (currentVoteStatus && currentVoteStatus !== voteType) {
        // Change vote
        setCurrentVoteStatus(voteType);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => prev + 1);
          setCurrentDownvotes(prev => Math.max(0, prev - 1));
        } else {
          setCurrentDownvotes(prev => prev + 1);
          setCurrentUpvotes(prev => Math.max(0, prev - 1));
        }
      } else {
        // New vote
        setCurrentVoteStatus(voteType);
        if (voteType === VoteType.UPVOTE) {
          setCurrentUpvotes(prev => prev + 1);
        } else {
          setCurrentDownvotes(prev => prev + 1);
        }
      }

      onVoteUpdate?.();
    } catch (error) {
      if(error == 'Error: No refresh token available'){
        toast.error('Bạn cần đăng nhập để thực hiện hành động này!');
        return;
      }
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const netVotes = currentUpvotes - currentDownvotes;

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote(VoteType.UPVOTE)}
        disabled={isVoting}
        className={`
          ${sizeClasses[size]} rounded-md border transition-all duration-200 flex items-center justify-center
          ${currentVoteStatus === VoteType.UPVOTE
            ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-700 hover:text-green-600 dark:hover:text-green-400'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Upvote"
      >
        <ChevronUp className={iconSizeClasses[size]} />
      </button>

      {/* Vote Count */}
      <div className={`
        font-semibold ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
        ${netVotes > 0 ? 'text-green-600 dark:text-green-400' : netVotes < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}
      `}>
        {netVotes > 0 ? `+${netVotes}` : netVotes}
      </div>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote(VoteType.DOWNVOTE)}
        disabled={isVoting}
        className={`
          ${sizeClasses[size]} rounded-md border transition-all duration-200 flex items-center justify-center
          ${currentVoteStatus === VoteType.DOWNVOTE
            ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400'
          }
          ${isVoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title="Downvote"
      >
        <ChevronDown className={iconSizeClasses[size]} />
      </button>
    </div>
  );
};

export default VoteButton; 