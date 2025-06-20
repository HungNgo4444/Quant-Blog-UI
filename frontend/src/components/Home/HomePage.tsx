'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import MainLayout from '../Layout/MainLayout';
import ClientSidePosts from './ClientSidePosts';
import FeaturedPosts from './FeaturedPosts';
import { Post } from '../../types';
import { useAppSelector } from '../../store';

const AuthenticatedActions = ({ user, mounted }: { user: any; mounted: boolean }) => {
  if (!mounted) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" className="bg-white text-black hover:bg-gray-100">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button variant="outline" size="lg">
          Tham gia ngay
        </Button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/posts/create">
          <Button size="lg" className="bg-white text-black hover:bg-gray-100">
            Tạo bài viết mới
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/my-posts">
          <Button 
            variant="outline" 
            size="lg"
            className="border-black text-black dark:text-white dark:border-white"
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
        <Button size="lg" className="bg-white text-black hover:bg-gray-100">
          Khám phá bài viết
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
      <Link href="/auth/register">
        <Button 
          variant="outline" 
          size="lg"
          className="border-black text-black hover:bg-gray-100 hover:text-black dark:border-white dark:text-white dark:hover:bg-gray-800 dark:hover:text-white"
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
      <section className="bg-gradient-to-r text-black py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              Chia sẻ kiến thức, kết nối cộng đồng
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 dark:text-white">
              Nơi những ý tưởng được lan tỏa và kiến thức được chia sẻ
            </p>
            <AuthenticatedActions user={user} mounted={mounted} />
          </div>
        </div>
      </section>

      <FeaturedPosts />
      <ClientSidePosts user={user}/>

      {mounted && !isAuthenticated && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Bắt đầu hành trình viết blog
              </h2>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8">
                Chia sẻ kiến thức của bạn với cộng đồng và xây dựng thương hiệu cá nhân
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <Link href="/auth/register" className="block">
                  <Button size="lg" className="w-full">
                    Tạo tài khoản
                  </Button>
                </Link>
                <Link href="/about" className="block">
                  <Button variant="outline" size="lg" className="w-full">
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