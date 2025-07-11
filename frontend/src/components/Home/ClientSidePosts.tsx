'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateReadingTime } from '../../lib/utils';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { toast } from 'react-toastify';
import RecentPosts from './RecentPosts';
import TopPosts from './TopPosts';
import { getAllCategoriesWithPostCount } from 'frontend/src/services/CategoryService';
import { 
  Twitter,
  Github,
  Linkedin,
  Clock,
  TrendingUp,
  Hash,
  ExternalLink
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import FeaturedTags from './FeaturedTags';

const ClientSidePosts = ({ user }: { user: any }) => {
  const dispatch = useAppDispatch();
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
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

    fetchCategories();
  }, []);

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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-red-500 text-center">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            
            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-1.5 shadow-lg border border-gray-100 dark:border-gray-700">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => handleTabChange(0)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === 0
                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Mới nhất
                    </div>
                  </button>
                  <button
                    onClick={() => handleTabChange(1)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      activeTab === 1
                        ? 'bg-gradient-to-r from-gray-900 to-gray-700 text-white shadow-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Đánh giá cao nhất
                    </div>
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
            <div className="sticky top-24 space-y-6">
              {/* Author Info */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 p-1 shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900">
                        <img src="/logo.png" alt="logo" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    QuantBlog
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed text-sm">
                    Chia sẻ kiến thức, kinh nghiệm Tài chính và Công nghệ.
                  </p>
                  
                  <div className="flex justify-center gap-2">
                    <button className="w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Twitter className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Github className="w-3.5 h-3.5" />
                    </button>
                    <button className="w-8 h-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Linkedin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-lg flex items-center justify-center">
                    <Hash className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Chủ đề
                  </h3>
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {categories.map((category, index) => (
                    <Link 
                      key={index}
                      href={`/posts?category=${category.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                        <div className="flex items-center gap-2.5">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-gray-900 dark:group-hover:bg-white transition-colors"></div>
                          <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white font-medium text-sm">
                            {category.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {category.postCount}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <FeaturedTags />
      </div>
    </section>
  );
};

export default ClientSidePosts; 