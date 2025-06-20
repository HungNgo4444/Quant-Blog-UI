"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { getRecentPost } from "../../../services/PostService";

export function RecentPosts() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response= await getRecentPost(1, 5);
        setPosts(response.posts);
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      {posts.map((post: any) => (
        <div key={post.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            {post.author.avatar ? (
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
            ) : (
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{post.title}</p>
            <p className="text-sm text-muted-foreground">
              Bởi {post.author.name} • {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
            </p>
          </div>
          <div className={`ml-auto text-sm ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "published":
      return "text-green-500";
    case "draft":
      return "text-yellow-500";
    case "review":
      return "text-blue-500";
    default:
      return "text-gray-500";
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case "published":
      return "Đã xuất bản";
    case "draft":
      return "Bản nháp";
    case "review":
      return "Đang duyệt";
    default:
      return "Không xác định";
  }
} 