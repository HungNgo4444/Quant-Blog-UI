'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUserProfile, getUserPosts } from '../../../services/UserService';
import { PostCard } from '../../../components/Posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Eye, FileText, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  createdAt: string;
  stats: {
    totalPosts: number;
    totalViews: number;
  };
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  publishedAt: string;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  category: {
    name: string;
    slug: string;
    color: string;
  };
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface PostsResponse {
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export default function ProfileUserPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostsResponse>({
    posts: [],
    pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 }
  });
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadProfile = async () => {
    try {
      const profileData = await getUserProfile(userId);
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadPosts = async (page: number = 1) => {
    setLoadingPosts(true);
    try {
      const postsData = await getUserPosts(userId, page, 6);
      setPosts(postsData);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      setLoading(false);
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Profile Section */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Profile Card */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-none bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    {/* Avatar */}
                    <div className="flex justify-center">
                      <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-700 shadow-lg">
                        {profile.avatar ? (
                          <AvatarImage src={profile.avatar} alt={profile.name} />
                        ) : (
                          <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(profile.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    {/* Name & Bio */}
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile.name}
                      </h1>
                      {profile.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {profile.stats.totalPosts}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Bài viết
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400 mb-1">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                          {profile.stats.totalViews.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Lượt xem
                        </div>
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
                      <Calendar className="w-4 h-4" />
                      <span>Tham gia {formatDate(profile.createdAt)}</span>
                    </div>

                    {/* Social Links */}
                    {profile.socialLinks ? (
                      <div className="flex items-center justify-center space-x-2 pt-4">
                        {profile.socialLinks.website && profile.socialLinks.website.includes('facebook.com') && (
                          <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="p-2 border-none bg-blue-600 text-white">
                              <FacebookIcon className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.socialLinks.twitter && profile.socialLinks.twitter.includes('x.com') && (
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="p-2 border-none bg-black text-white">
                              <XIcon className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.socialLinks.linkedin && profile.socialLinks.linkedin.includes('linkedin.com') && (
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="p-2 border-none bg-blue-600 text-white">
                              <LinkedInIcon className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                        {profile.socialLinks.github && profile.socialLinks.github.includes('github.com') && (
                          <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="p-2 border-none bg-black text-white">
                              <GitHubIcon className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 pt-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Người dùng này chưa liên kết mạng xã hội
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content - Posts Section */}
          <div className="flex-1 min-w-0">
        <div className="p-4 mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Bài viết
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {posts.pagination.totalItems} bài viết đã được xuất bản
          </p>
        </div>

        {loadingPosts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-600 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {posts.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => loadPosts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Trước</span>
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, posts.pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => loadPosts(page)}
                        size="sm"
                        className={`${currentPage === page ? "bg-black text-white" : "bg-white text-black"}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => loadPosts(currentPage + 1)}
                  disabled={currentPage === posts.pagination.totalPages}
                  className="flex items-center space-x-1"
                >
                  <span>Sau</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chưa có bài viết nào
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.name} chưa xuất bản bài viết nào.
              </p>
            </CardContent>
          </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}