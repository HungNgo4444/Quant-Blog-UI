'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateReadingTime } from '../../lib/utils';
import { Post } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { toast } from 'react-toastify';
import { getRecentPost } from '../../services/PostService';
import { 
  Clock,
  Bookmark,
  BookmarkIcon,
  Calendar,
} from 'lucide-react';

const RecentPosts = () => {
  const dispatch = useAppDispatch();
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch recent posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await getRecentPost(10);
        setPosts(res || []);
      } catch (err) {
        console.error('Error fetching recent posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch recent posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Fetch save status cho các posts khi user đã login và posts đã load
  useEffect(() => {
    if (mounted && isAuthenticated && posts.length > 0) {
      const slugs = posts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, mounted, isAuthenticated, posts]);

  // Handle toggle save với optimistic update
  const handleToggleSave = (slug: string, currentSaved: boolean, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    // Optimistic update
    dispatch(optimisticToggleSave({ slug, saved: !currentSaved }));
    
    // Thực hiện API call
    dispatch(togglePostSave(slug)).then((response: any) => {
      if (response.payload.message) {
        toast.success(response.payload.message);
      } else {
        toast.error(response.payload.message);
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="flex-1 p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse w-1/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse w-3/4" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mt-4 animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-500 text-center">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isSaved = saveStatus[post.slug] || false;
        
        return (
          <div key={post.id} className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Save button overlay */}
            {mounted && isAuthenticated && (
              <div className="absolute top-4 right-4 bg-black/60 rounded-lg z-10">
                <button
                  onClick={(e) => handleToggleSave(post.slug, saveStatus[post.slug] || false, e)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={saveStatus[post.slug] ? 'Bỏ lưu' : 'Lưu bài viết'}
                >
                  {saveStatus[post.slug] ? (
                    <Bookmark className="h-4 w-4 fill-current" />
                  ) : (
                    <BookmarkIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center">
              {/* Featured Image */}
              {post.featuredImage ? (
                <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 relative overflow-hidden">
                  <Link href={`/posts/${post.slug}`}>
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                </div>
              ) : (
                <div className="w-full sm:w-48 md:w-64 h-32 md:h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}

              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                    {post.category?.name || ''}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                  <Link href={`/posts/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed line-clamp-2">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {post.author?.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {post.author?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {calculateReadingTime(post.content)} phút đọc
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentPosts; 