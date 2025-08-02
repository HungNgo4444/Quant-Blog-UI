'use client';

import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Link from 'next/link';

interface AnswerFormProps {
  questionId: string;
  onSubmit: (content: string) => Promise<void>;
  isSubmitting: boolean;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ questionId, onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await onSubmit(content);
    setContent('');
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Đăng nhập để trả lời câu hỏi
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bạn cần đăng nhập để có thể trả lời câu hỏi này
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Viết câu trả lời của bạn
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết câu trả lời chi tiết và hữu ích..."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi câu trả lời'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnswerForm;