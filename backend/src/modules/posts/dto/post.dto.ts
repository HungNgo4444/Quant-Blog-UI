import { PostStatus } from '../../../entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray, IsUUID, MinLength, MaxLength } from 'class-validator';

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

export class CreatePostDto {
  @ApiProperty({ description: 'Tiêu đề bài viết' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Nội dung bài viết (Markdown)' })
  @IsString()
  @MinLength(1)
  content: string;

  @ApiProperty({ description: 'Tóm tắt bài viết', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'ID danh mục' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Danh sách ID thẻ', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tags?: string[];

  @ApiProperty({ description: 'URL ảnh đại diện', required: false })
  @IsOptional()
  @IsString()
  featured_image?: string;

  @ApiProperty({ description: 'Trạng thái xuất bản', default: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ description: 'SEO Title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @ApiProperty({ description: 'SEO Description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @ApiProperty({ description: 'Meta Keywords', required: false })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({ description: 'OG Title', required: false })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiProperty({ description: 'OG Description', required: false })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiProperty({ description: 'OG Image', required: false })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiProperty({ description: 'Twitter Title', required: false })
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiProperty({ description: 'Twitter Description', required: false })
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiProperty({ description: 'Twitter Image', required: false })
  @IsOptional()
  @IsString()
  twitterImage?: string;

  @ApiProperty({ description: 'Cho phép bình luận', default: true })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;
}

export class UpdatePostDto {
  @ApiProperty({ description: 'Tiêu đề bài viết', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiProperty({ description: 'Nội dung bài viết (Markdown)', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @ApiProperty({ description: 'Tóm tắt bài viết', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ description: 'ID danh mục', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Danh sách ID thẻ', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tags?: string[];

  @ApiProperty({ description: 'URL ảnh đại diện', required: false })
  @IsOptional()
  @IsString()
  featured_image?: string;

  @ApiProperty({ description: 'Trạng thái xuất bản', required: false })
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @ApiProperty({ description: 'SEO Title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string;

  @ApiProperty({ description: 'SEO Description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoDescription?: string;

  @ApiProperty({ description: 'Meta Keywords', required: false })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiProperty({ description: 'OG Title', required: false })
  @IsOptional()
  @IsString()
  ogTitle?: string;

  @ApiProperty({ description: 'OG Description', required: false })
  @IsOptional()
  @IsString()
  ogDescription?: string;

  @ApiProperty({ description: 'OG Image', required: false })
  @IsOptional()
  @IsString()
  ogImage?: string;

  @ApiProperty({ description: 'Twitter Title', required: false })
  @IsOptional()
  @IsString()
  twitterTitle?: string;

  @ApiProperty({ description: 'Twitter Description', required: false })
  @IsOptional()
  @IsString()
  twitterDescription?: string;

  @ApiProperty({ description: 'Twitter Image', required: false })
  @IsOptional()
  @IsString()
  twitterImage?: string;

  @ApiProperty({ description: 'Cho phép bình luận', required: false })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;
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