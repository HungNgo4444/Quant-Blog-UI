'use client';

import { useState, useEffect, useMemo } from 'react';
import MyPostsHeader from '../../components/MyPosts/MyPostsHeader';
import MyPostsTabs from '../../components/MyPosts/MyPostsTabs';
import MyPostsFilters from '../../components/MyPosts/MyPostsFilters';
import { Post } from '../../types';
import { getPostsByUser, getSavedPostsByUser } from '../../services/PostService';

export default function MyPostsPage() {
  const [allMyPosts, setAllMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

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

  const fetchPostsByUser = async (page: number = 1) => {
    try {
      setLoading(true);
      
      console.log(`🔍 Fetching my posts - Page: ${page}, Limit: 5`);
      const res = await getPostsByUser(page, 5, '', '', '');
      console.log('📊 My posts API response:', res);
      
      if (res && res.posts) {
        console.log(`✅ My posts received: ${res.posts.length} posts on page ${page}`);
        console.log('📈 My posts pagination:', res.pagination);
        
        setAllMyPosts(res.posts);

        setMyPostsPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          itemsPerPage: res.pagination.itemsPerPage,
          hasMore: res.pagination.currentPage < res.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('❌ Error fetching posts by user:', error);
      setAllMyPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedPostsByUser = async (page: number = 1) => {
    try {
      setLoading(true);
      
      console.log(`🔍 Fetching saved posts - Page: ${page}, Limit: 5`);
      const res = await getSavedPostsByUser(page, 5, '', '', '');
      console.log('📊 Saved posts API response:', res);
      
      if (res && res.posts) {
        console.log(`✅ Saved posts received: ${res.posts.length} posts on page ${page}`);
        console.log('📈 Saved posts pagination:', res.pagination);
        
        setSavedPosts(res.posts);

        setSavedPostsPagination({
          currentPage: res.pagination.currentPage,
          totalPages: res.pagination.totalPages,
          totalItems: res.pagination.totalItems,
          itemsPerPage: res.pagination.itemsPerPage,
          hasMore: res.pagination.currentPage < res.pagination.totalPages
        });
      }
    } catch (error) {
      console.error('❌ Error fetching saved posts by user:', error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Page change functions
  const handleMyPostsPageChange = (page: number) => {
    if (page !== myPostsPagination.currentPage && page >= 1 && page <= myPostsPagination.totalPages) {
      fetchPostsByUser(page);
    }
  };

  const handleSavedPostsPageChange = (page: number) => {
    if (page !== savedPostsPagination.currentPage && page >= 1 && page <= savedPostsPagination.totalPages) {
      fetchSavedPostsByUser(page);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchPostsByUser(),
        fetchSavedPostsByUser()
      ]);
    };

    fetchData();
  }, []);

  // Filtered and sorted posts
  const filteredMyPosts = useMemo(() => {
    if (!Array.isArray(allMyPosts)) {
      console.error('allMyPosts is not an array:', allMyPosts);
      return [];
    }
    
    let filtered = [...allMyPosts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-viewed':
          return b.viewCount - a.viewCount;
        case 'most-liked':
          return b.likeCount - a.likeCount;
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [allMyPosts, searchTerm, statusFilter, sortBy]);

  const totalViews = Array.isArray(allMyPosts) 
    ? allMyPosts.reduce((sum, post) => sum + post.viewCount, 0) 
    : 0;

  // Handle post deletion
  const handlePostDeleted = (deletedSlug: string) => {
    setAllMyPosts(prevPosts => prevPosts.filter(post => post.slug !== deletedSlug));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyPostsHeader 
          totalPosts={Array.isArray(allMyPosts) ? allMyPosts.length : 0}
          totalViews={totalViews}
        />
        
        <MyPostsFilters
          onSearchChange={setSearchTerm}
          onStatusFilter={setStatusFilter}
          onSortChange={setSortBy}
        />
        
        <MyPostsTabs 
          myPosts={filteredMyPosts}
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
