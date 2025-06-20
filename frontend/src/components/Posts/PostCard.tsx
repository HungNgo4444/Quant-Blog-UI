import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Eye, Heart, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

interface PostCardProps {
  post: {
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
  };
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
      <Link href={`/posts/${post.slug}`}>
    <Card className="group flex flex-col bg-gray-100 justify-between hover:shadow-lg h-full transition-all duration-300 border-0 dark:bg-gray-800 overflow-hidden">
      <div className="relative">
        {post.featuredImage && (
          <div className="relative h-36 overflow-hidden">
            <img    
              src={post.featuredImage}
              alt={post.title}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <div 
            className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-black text-white"
          >
            {post.category.name}
          </div>
        </div>
      </div>
      
      <div className="p-3 mb-auto pb-0">
        
          <h3 className="text-md font-bold line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
        
        
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 text-sm leading-relaxed">
          {post.excerpt}
        </p>
      </div>
      <CardContent className="p-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} phút đọc</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(post.publishedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
      </Link>
  );
} 