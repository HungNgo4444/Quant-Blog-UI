'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { getAllCategories } from '../../services/CategoryService';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface MyPostsFiltersProps {
  searchTerm?: string;
  statusFilter?: string;
  sortBy?: string;
  categoryFilter?: string;
  tagFilter?: string;
  loading?: boolean;
  onSearchChange: (search: string) => void;
  onStatusFilter: (status: string) => void;
  onSortChange: (sort: string) => void;
  onCategoryFilter?: (category: string) => void;
  onTagFilter?: (tag: string) => void;
}

export default function MyPostsFilters({ 
  searchTerm = '',
  statusFilter = 'all',
  sortBy = 'newest',
  categoryFilter = '',
  tagFilter = '',
  loading = false,
  onSearchChange, 
  onStatusFilter, 
  onSortChange,
  onCategoryFilter,
  onTagFilter
}: MyPostsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categoriesData = await getAllCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (onCategoryFilter && categories && !categories.length) {
      fetchCategories();
    }
  }, [onCategoryFilter]);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleStatusChange = (value: string) => {
    onStatusFilter(value);
  };

  const handleSortChange = (value: string) => {
    onSortChange(value);
  };

  const handleCategoryChange = (value: string) => {
    if (onCategoryFilter) {
      onCategoryFilter(value);
    }
  };

  const handleTagChange = (value: string) => {
    if (onTagFilter) {
      onTagFilter(value);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`h-4 w-4 ${loading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm kiếm bài viết của bạn..."
            disabled={loading}
            className="block w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
          {(statusFilter !== 'all' || categoryFilter || tagFilter || sortBy !== 'newest') && (
            <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={loading}
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="all">Tất cả</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                disabled={loading}
                className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="most-viewed">Nhiều lượt xem nhất</option>
                <option value="most-liked">Nhiều lượt thích nhất</option>
                <option value="title-asc">Tiêu đề A-Z</option>
                <option value="title-desc">Tiêu đề Z-A</option>
              </select>
            </div>

            {/* Category Filter */}
            {onCategoryFilter && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Danh mục
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={loading || categoriesLoading}
                  className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <option value="">Tất cả danh mục</option>
                  {categoriesLoading ? (
                    <option disabled>Đang tải...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(statusFilter !== 'all' || categoryFilter || tagFilter || sortBy !== 'newest') && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-600">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bộ lọc đang áp dụng:</span>
                
                {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                    Trạng thái: {statusFilter === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                )}

                {categoryFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                    Danh mục: {categories.find(cat => cat.slug === categoryFilter)?.name || categoryFilter}
                  </span>
                )}

                {tagFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                    Tag: {tagFilter}
                  </span>
                )}

                {sortBy !== 'newest' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-medium rounded-full">
                    Sắp xếp: {sortBy === 'oldest' ? 'Cũ nhất' : 
                             sortBy === 'most-viewed' ? 'Nhiều lượt xem' : 
                             sortBy === 'most-liked' ? 'Nhiều lượt thích' :
                             sortBy === 'title-asc' ? 'Tiêu đề A-Z' :
                             sortBy === 'title-desc' ? 'Tiêu đề Z-A' : sortBy}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 