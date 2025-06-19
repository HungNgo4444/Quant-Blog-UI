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
import RecentPosts from './RecentPosts';
import TopPosts from './TopPosts';
import { getAllCategoriesWithPostCount } from 'frontend/src/services/CategoryService';
import { 
  Clock,
  Bookmark,
  BookmarkIcon,
  User,
  Twitter,
  Github,
  Linkedin,
  Calendar,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

const ClientSidePosts = ({ user }: { user: any }) => {
  const dispatch = useAppDispatch();
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoriesWithPostCount();
        setCategories(res || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch categories');
      }
    };

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await getRecentPost(6);
        setPosts(res || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    fetchCategories();
  }, []);

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

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  if (error) {
    return (
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-500 text-center">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Tab Navigation */}
            <div className="mb-10">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => handleTabChange(0)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 0
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => handleTabChange(1)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 1
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    Đánh giá cao nhất
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 0 && <RecentPosts />}
              {activeTab === 1 && <TopPosts />}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Author Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-300">
                <Avatar className="h-20 w-20">
                  {user?.avatar ? (
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                  ) : (
                    <AvatarFallback className="text-sm bg-gray-300 dark:text-black">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {user?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Chia sẻ kiến thức, kinh nghiệm Tài chính và Công nghệ.
                </p>
                
                <div className="flex justify-center gap-2">
                  <button className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Github className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <Linkedin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">
                Chủ đề
              </h3>
              
              <div className="space-y-1">
                {categories.map((category, index) => (
                  <div key={index}>
                    <Link 
                      href={`/posts?category=${category.slug}`}
                      className="block py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-500">
                          ({category.postCount})
                        </span>
                      </div>
                    </Link>
                    {index < categories.length - 1 && (
                      <div className="border-b border-gray-200 dark:border-gray-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSidePosts; 