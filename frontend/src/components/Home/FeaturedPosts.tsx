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
  MessageCircle
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
    <section className="py-8 dark:bg-gray-800 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="px-8">
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Bài viết nổi bật
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Những bài viết được yêu thích nhất từ cộng đồng
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                <div className="h-48 bg-gray-200 dark:bg-gray-600 animate-pulse rounded-t-xl" />
                <div className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse" />
                  <div className="h-16 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
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
              <CarouselContent className="-ml-4">
                {featuredPosts.map((post: Post) => {
                  const isSaved = saveStatus[post.slug] || false;
                  
                  return (
                    <CarouselItem key={post.id} className="pl-5 basis-full sm:basis-1/2 lg:basis-1/3">
                      <div className="group bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg hover:scale-[101%] transition-all duration-500 h-full">
                        <div className="relative">
                          {post.featuredImage && (
                            <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden rounded-t-xl">
                              <Link href={`/posts/${post.slug}`}>
                                <img
                                  src={post.featuredImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover group-hover:scale-[102%] transition-transform duration-500"
                                />
                              </Link> 
                            </div>
                          )}
                          
                          {/* Save button overlay - chỉ hiển thị sau khi mounted */}
                          {mounted && (
                            <div className="absolute top-2 right-2 bg-black/60 rounded-lg">
                              <button
                                onClick={(e) => handleToggleSave(post.slug, isSaved, e)}
                                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                title={isSaved ? 'Bỏ lưu' : 'Lưu bài viết'}
                              >
                                {isSaved ? (
                                  <Bookmark className="h-4 w-4 fill-current" />
                                ) : (
                                  <BookmarkIcon className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6 dark:bg-gray-900 dark:rounded-b-xl flex flex-col justify-between h-56">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 rounded-full">
                              {post.category?.name || ''}
                            </span>
                            <div className="flex items-center text-gray-500 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {calculateReadingTime(post.content)} phút đọc
                            </div>
                          </div>
                          
                          <h3 className="text-md font-semibold mb-2 line-clamp-2">
                            <Link
                              href={`/posts/${post.slug}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {post.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 text-sm">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            <Link href={`/profile/${post.author?.id}`}>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                                  {post.author?.avatar ? (
                                    <img
                                      src={post.author.avatar}
                                      alt={post.author.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                      {post.author?.name?.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400 truncate hover:text-black dark:hover:text-white transition-colors">
                                    {post.author?.name}
                                </span>
                              </div>
                            </Link>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
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
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Navigation buttons with better positioning */}
              <CarouselPrevious 
                className="hidden sm:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-black opacity-50 text-white hover:bg-black/80 hover:text-white"
                style={{
                  left: '-20px',
                  width: '45px',
                  height: '45px',
                }}
              />
              <CarouselNext 
                className="hidden sm:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-black opacity-50 text-white hover:bg-black/80 hover:text-white"
                style={{
                  right: '-20px',
                  width: '45px',
                  height: '45px',
                }}
              />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}