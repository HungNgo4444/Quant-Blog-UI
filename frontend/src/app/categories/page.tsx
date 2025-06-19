'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  Article,
} from '@mui/icons-material';
import Link from 'next/link';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  postCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Simulated data - replace with actual API call to backend
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'Technology',
          slug: 'technology',
          description: 'Latest technology trends, innovations, and insights from the tech world',
          color: '#3b82f6',
          postCount: 15
        },
        {
          id: '2',
          name: 'Tutorial',
          slug: 'tutorial',
          description: 'Step-by-step guides and tutorials for developers',
          color: '#10b981',
          postCount: 23
        },
        {
          id: '3',
          name: 'Programming',
          slug: 'programming',
          description: 'Programming tips, best practices, and coding techniques',
          color: '#8b5cf6',
          postCount: 18
        },
        {
          id: '4',
          name: 'Web Development',
          slug: 'web-development',
          description: 'Frontend and backend web development topics',
          color: '#f59e0b',
          postCount: 31
        },
        {
          id: '5',
          name: 'DevOps',
          slug: 'devops',
          description: 'Infrastructure, deployment, and DevOps practices',
          color: '#ef4444',
          postCount: 12
        },
        {
          id: '6',
          name: 'Mobile Development',
          slug: 'mobile-development',
          description: 'iOS, Android, and cross-platform mobile development',
          color: '#06b6d4',
          postCount: 8
        }
      ];

      setCategories(mockCategories);
      setLoading(false);
    } catch (err) {
      setError('Không thể tải danh sách danh mục');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6">Danh mục</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Danh mục</h1>
        <p className="text-xl text-gray-600">
          Khám phá các chủ đề và danh mục bài viết
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="text-decoration-none"
          >
            <Card className="h-full transition-transform duration-200 hover:scale-105 hover:shadow-lg cursor-pointer">
              <CardContent className="h-full flex flex-col p-6">
                <div className="flex items-center mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: category.color }}
                  >
                    <Folder className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-2">{category.name}</h2>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Article className="h-3 w-3" />
                      {category.postCount} bài viết
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 flex-1 line-clamp-3">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium text-gray-900">
            Chưa có danh mục nào
          </h3>
        </div>
      )}
    </div>
  );
} 