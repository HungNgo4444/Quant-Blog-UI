'use client';

import { Plus, FileText, BarChart3 } from 'lucide-react';

interface MyPostsHeaderProps {
  totalPosts: number;
  totalViews: number;
}

export default function MyPostsHeader({ totalPosts, totalViews }: MyPostsHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Header Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Bài viết của tôi
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Quản lý và theo dõi tất cả bài viết của bạn
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href="/posts/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Viết bài mới
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng bài viết</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalPosts.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng lượt xem</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalViews.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 