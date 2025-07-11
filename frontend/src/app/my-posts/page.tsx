'use client';

import { useState, useEffect, useCallback } from 'react';
import MyPostsHeader from '../../components/MyPosts/MyPostsHeader';
import MyPostsTabs from '../../components/MyPosts/MyPostsTabs';
import MyPostsFilters from '../../components/MyPosts/MyPostsFilters';
import { Post } from '../../types';
import { getPostsByUser, getSavedPostsByUser, getUserPostsStats } from '../../services/PostService';
import { useDebounce } from '../../hooks/useDebounce';

export default function MyPostsPage() {
  const [allMyPosts, setAllMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalPosts: 0,
    totalViews: 0
  });
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  // Pagination states
  const [myPostsPagination, setMyPostsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
    hasMore: false
  });

  const [savedPostsPagination, setSavedPostsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 5,
    hasMore: false
  });

  const fetchUserStats = async () => {
    try {
      const stats = await getUserPostsStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchPostsByUser = useCallback(async (
    page: number = 1, 
    resetPagination: boolean = false
  ) => {
    try {
      setLoading(true);
      
      const res = await getPostsByUser(
        page, 
        5, 
        categoryFilter, 
        tagFilter, 
        debouncedSearchTerm,
        statusFilter !== 'all' ? statusFilter : 'all',
        sortBy
      );
      
      if (res && res.posts) {
        setAllMyPosts(res.posts);

        const paginationData = {
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          itemsPerPage: res.pagination.itemsPerPage,
          hasMore: res.pagination.currentPage < res.pagination.totalPages
        };

        setMyPostsPagination(paginationData);

        // Reset to page 1 if we're applying new filters
        if (resetPagination && page !== 1) {
          // Recursively call with page 1
          setTimeout(() => fetchPostsByUser(1, false), 100);
        }
      }
    } catch (error) {
      console.error('Error fetching posts by user:', error);
      setAllMyPosts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, tagFilter, debouncedSearchTerm, statusFilter, sortBy]);

  const fetchSavedPostsByUser = useCallback(async (
    page: number = 1, 
    resetPagination: boolean = false
  ) => {
    try {
      setLoading(true);
      
      const res = await getSavedPostsByUser(
        page, 
        5, 
        categoryFilter, 
        tagFilter, 
        debouncedSearchTerm,
        sortBy
      );
      
      if (res && res.posts) {
        setSavedPosts(res.posts);

        const paginationData = {
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          itemsPerPage: res.pagination.itemsPerPage,
          hasMore: res.pagination.currentPage < res.pagination.totalPages
        };

        setSavedPostsPagination(paginationData);

        // Reset to page 1 if we're applying new filters
        if (resetPagination && page !== 1) {
          // Recursively call with page 1
          setTimeout(() => fetchSavedPostsByUser(1, false), 100);
        }
      }
    } catch (error) {
      console.error('Error fetching saved posts by user:', error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, tagFilter, debouncedSearchTerm, sortBy]);

  // Page change functions
  const handleMyPostsPageChange = (page: number) => {
    if (page !== myPostsPagination.currentPage && page >= 1 && page <= myPostsPagination.totalPages) {
      fetchPostsByUser(page, false);
    }
  };

  const handleSavedPostsPageChange = (page: number) => {
    if (page !== savedPostsPagination.currentPage && page >= 1 && page <= savedPostsPagination.totalPages) {
      fetchSavedPostsByUser(page, false);
    }
  };

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchUserStats(),
        fetchPostsByUser(1, false),
        fetchSavedPostsByUser(1, false)
      ]);
    };

    fetchData();
  }, []);

  // Re-fetch when filters change (with debounced search)
  useEffect(() => {
    // Reset to page 1 when filters change
    fetchPostsByUser(1, true);
    fetchSavedPostsByUser(1, true);
  }, [debouncedSearchTerm, statusFilter, sortBy, categoryFilter, tagFilter]);

  // Handle post deletion
  const handlePostDeleted = (deletedSlug: string) => {
    setAllMyPosts(prevPosts => prevPosts.filter(post => post.slug !== deletedSlug));
    // Refresh user stats after deletion
    fetchUserStats();
  };

  // Filter change handlers
  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
  };

  const handleTagFilter = (tag: string) => {
    setTagFilter(tag);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bài viết của tôi
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý và theo dõi tất cả bài viết của bạn
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4 mt-4 sm:mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 min-w-[100px]">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{userStats.totalPosts}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Bài viết</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 min-w-[100px]">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{userStats.totalViews}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Lượt xem</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <MyPostsFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          sortBy={sortBy}
          categoryFilter={categoryFilter}
          tagFilter={tagFilter}
          onSearchChange={handleSearchChange}
          onStatusFilter={handleStatusFilter}
          onSortChange={handleSortChange}
          onCategoryFilter={handleCategoryFilter}
          onTagFilter={handleTagFilter}
          loading={loading}
        />
        
        <MyPostsTabs 
          myPosts={allMyPosts}
          savedPosts={savedPosts}
          loading={loading}
          onPostDeleted={handlePostDeleted}
          myPostsPagination={myPostsPagination}
          savedPostsPagination={savedPostsPagination}
          onMyPostsPageChange={handleMyPostsPageChange}
          onSavedPostsPageChange={handleSavedPostsPageChange}
        />
      </div>
    </div>
  );
}
