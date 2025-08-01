'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react';
import MainLayout from '../Layout/MainLayout';
import ClientSidePosts from './ClientSidePosts';
import FeaturedPosts from './FeaturedPosts';
import { Post } from '../../types';
import { useAppSelector } from '../../store';
import '../../styles/hero-section.css';

const AuthenticatedActions = ({ user, mounted }: { user: any; mounted: boolean }) => {
  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg" className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg">
          Tham gia ngay
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/posts/create">
          <Button size="lg" className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg">
            Tạo bài viết mới
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/my-posts">
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900 shadow-lg"
          >
            Quản lý bài viết
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link href="/posts">
        <Button size="lg" className="bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button 
          variant="outline" 
          size="lg"
          className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-gray-900 shadow-lg"
        >
          Tham gia ngay
        </Button>
      </Link>
    </div>
  );
};

const HomePage = () => {
  const { user: reduxUser, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  const user = reduxUser;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-image-hero bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-16 md:py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium">
                Nền tảng chia sẻ kiến thức
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight">
              Chia sẻ kiến thức,
              <br />
              <span className="text-2xl md:text-4xl">kết nối cộng đồng</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-white dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Nơi những ý tưởng được lan tỏa và kiến thức được chia sẻ một cách có ý nghĩa
            </p>
            
            <AuthenticatedActions user={user} mounted={mounted} />
            
          </div>
        </div>
      </section>

      <FeaturedPosts />
      <ClientSidePosts user={user}/>

      {mounted && !isAuthenticated && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-xl border border-gray-100 dark:border-gray-700">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-white dark:text-gray-900" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Bắt đầu hành trình viết blog
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                Chia sẻ kiến thức của bạn với cộng đồng và xây dựng thương hiệu cá nhân một cách chuyên nghiệp
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/auth/register" className="flex-1">
                  <Button size="lg" className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-lg">
                    Tạo tài khoản
                  </Button>
                </Link>
                <Link href="/about" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg">
                    Tìm hiểu thêm
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
};

export default HomePage; 