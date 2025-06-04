import { PostStatus } from '../../../entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';

export interface PostAuthorDto {
  id: string;
  name: string;
  avatar: string | null;
}

export interface PostCategoryDto {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface PostTagDto {
  id: string;
  name: string;
  slug: string;
}

export class PostResponseDto {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: PostStatus;
  publishedAt: Date;
  readingTime: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
  allowComments: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  categoryId: string;
  author: PostAuthorDto | null;
  category: PostCategoryDto | null;
  tags: PostTagDto[];
}

export class PaginationDto {
  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  itemsPerPage: number;
}

export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  posts: PostResponseDto[];

  @ApiProperty()
  pagination: PaginationDto;
} 