'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { calculateReadingTime } from "../../lib/utils";
import { useAppSelector, useAppDispatch } from "../../store";
import { getFeaturedPosts } from "../../services/PostService";
import { 
  fetchBulkSaveStatus, 
  togglePostSave, 
  optimisticToggleSave 
} from '../../store/slices/postsSlice';
import { toast } from 'react-toastify';
import { Post } from "../../types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { 
  Bookmark, 
  BookmarkIcon, 
  Eye, 
  ThumbsUp, 
  Clock,
  MessageCircle,
  TrendingUp
} from 'lucide-react';

export default function FeaturedPosts() {
  const dispatch = useAppDispatch();
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { saveStatus } = useAppSelector((state) => state.posts);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch featured posts
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        const posts = await getFeaturedPosts(10);
        setFeaturedPosts(posts);
      } catch (err) {
        console.error('Error fetching featured posts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch featured posts');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, []);

  // Fetch save status cho các posts khi user đã login và posts đã load
  useEffect(() => {
    if (mounted && isAuthenticated && featuredPosts.length > 0) {
      const slugs = featuredPosts.map(post => post.slug);
      dispatch(fetchBulkSaveStatus(slugs));
    }
  }, [dispatch, mounted, isAuthenticated, featuredPosts]);

  // Handle toggle save với optimistic update
  const handleToggleSave = (slug: string, currentSaved: boolean, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!isAuthenticated) {
      toast.warn('Bạn cần đăng nhập để lưu bài viết.')
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
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Nổi bật
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Bài viết được yêu thích nhất
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Khám phá những bài viết chất lượng cao được cộng đồng đánh giá và chia sẻ nhiều nhất
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden">
                <div className="h-56 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="p-8">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {featuredPosts.map((post: Post) => {
                  const isSaved = saveStatus[post.slug] || false;
                  
                  return (
                    <CarouselItem key={post.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full">
                        <div className="relative">
                          {post.featuredImage && (
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                              <Link href={`/posts/${post.slug}`}>
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              </Link>
                              
                              {/* Gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          )}
                          
                          {/* Save button overlay */}
                          {mounted && (
                            <div className="absolute top-3 right-3">
                              <button
                                onClick={(e) => handleToggleSave(post.slug, isSaved, e)}
                                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white p-2 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200"
                                title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                              >
                                {isSaved ? (
                                  <Bookmark className="h-4 w-4 fill-current text-blue-600" />
                                ) : (
                                  <BookmarkIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-5 flex flex-col justify-between h-64">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 dark:text-gray-900 rounded-full">
                                {post.category?.name || ''}
                              </span>
                              <div className="flex items-center text-gray-500 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {calculateReadingTime(post.content)} phút
                              </div>
                            </div>
                            
                            <h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                              <Link
                                href={`/posts/${post.slug}`}
                                className="hover:text-gray-700 dark:hover:text-gray-200"
                              >
                                {post.title}
                              </Link>
                            </h3>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Link href={`/profile/${post.author?.id}`}>
                                <div className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
                                    {post.author?.avatar ? (
                                      <img
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {post.author?.name?.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                      {post.author?.name}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{post.viewCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>{post.likeCount || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{post.commentCount || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Navigation buttons */}
              <CarouselPrevious 
                className="hidden sm:flex absolute -left-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                style={{
                  left: '-24px',
                  width: '48px',
                  height: '48px',
                }}
              />
              <CarouselNext 
                className="hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                style={{
                  right: '-24px',
                  width: '48px',
                  height: '48px',
                }}
              />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}