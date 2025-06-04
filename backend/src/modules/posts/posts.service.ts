import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';
import { PaginatedPostsResponseDto, PostResponseDto } from './dto/post.dto';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    category?: string,
    tag?: string,
    search?: string,
  ): Promise<PaginatedPostsResponseDto> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.authorId AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.categoryId AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featuredImage as featured_image',
        'post.status as status',
        'post.publishedAt as published_at',
        'post.readingTime as reading_time',
        'post.viewCount as view_count',
        'post.likeCount as like_count',
        'post.commentCount as comment_count',
        'post.shareCount as share_count',
        'post.metaTitle as meta_title',
        'post.metaDescription as meta_description',
        'post.metaKeywords as meta_keywords',
        'post.ogTitle as og_title',
        'post.ogDescription as og_description',
        'post.ogImage as og_image',
        'post.twitterTitle as twitter_title',
        'post.twitterDescription as twitter_description',
        'post.twitterImage as twitter_image',
        'post.allowComments as allow_comments',
        'post.active as active',
        'post.createdAt as created_at',
        'post.updatedAt as updated_at',
        'post.authorId as author_id',
        'post.categoryId as category_id',
        'user.id as user_id',
        'user.name as user_name',
        'user.avatar as user_avatar',
        'category.id as category_id',
        'category.name as category_name',
        'category.slug as category_slug',
        'category.color as category_color',
        'tag.id as tag_id',
        'tag.name as tag_name',
        'tag.slug as tag_slug'
      ])
      .where('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.active = :active', { active: true });

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    if (tag) {
      queryBuilder.andWhere('tag.slug = :tagSlug', { tagSlug: tag });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.excerpt ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get posts
    const posts = await queryBuilder
      .orderBy('post.publishedAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    // Group posts by ID to handle tags
    const postsMap = new Map();
    posts.forEach(raw => {
      const postId = raw.id;
      if (!postsMap.has(postId)) {
        postsMap.set(postId, {
          ...raw,
          author: {
            id: raw.user_id,
            name: raw.user_name,
            avatar: raw.user_avatar
          },
          category: {
            id: raw.category_id,
            name: raw.category_name,
            slug: raw.category_slug,
            color: raw.category_color
          },
          tags: []
        });
      }
      if (raw.tag_id) {
        const post = postsMap.get(postId);
        if (!post.tags.some(t => t.id === raw.tag_id)) {
          post.tags.push({
            id: raw.tag_id,
            name: raw.tag_name,
            slug: raw.tag_slug
          });
        }
      }
    });

    const mappedPosts = Array.from(postsMap.values()).map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featured_image,
      status: post.status,
      publishedAt: post.published_at,
      readingTime: post.reading_time,
      viewCount: post.view_count,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      shareCount: post.share_count,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      metaKeywords: post.meta_keywords,
      ogTitle: post.og_title,
      ogDescription: post.og_description,
      ogImage: post.og_image,
      twitterTitle: post.twitter_title,
      twitterDescription: post.twitter_description,
      twitterImage: post.twitter_image,
      allowComments: post.allow_comments,
      active: post.active,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      authorId: post.author_id,
      categoryId: post.category_id,
      author: post.author,
      category: post.category,
      tags: post.tags
    }));

    return {
      posts: mappedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOneBySlug(slug: string): Promise<PostResponseDto> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.authorId AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.categoryId AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featuredImage as featured_image',
        'post.status as status',
        'post.publishedAt as published_at',
        'post.readingTime as reading_time',
        'post.viewCount as view_count',
        'post.likeCount as like_count',
        'post.commentCount as comment_count',
        'post.shareCount as share_count',
        'post.metaTitle as meta_title',
        'post.metaDescription as meta_description',
        'post.metaKeywords as meta_keywords',
        'post.ogTitle as og_title',
        'post.ogDescription as og_description',
        'post.ogImage as og_image',
        'post.twitterTitle as twitter_title',
        'post.twitterDescription as twitter_description',
        'post.twitterImage as twitter_image',
        'post.allowComments as allow_comments',
        'post.active as active',
        'post.createdAt as created_at',
        'post.updatedAt as updated_at',
        'post.authorId as author_id',
        'post.categoryId as category_id',
        'user.id as user_id',
        'user.name as user_name',
        'user.avatar as user_avatar',
        'category.id as category_id',
        'category.name as category_name',
        'category.slug as category_slug',
        'category.color as category_color',
        'tag.id as tag_id',
        'tag.name as tag_name',
        'tag.slug as tag_slug'
      ])
      .where('post.slug = :slug', { slug })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.active = :active', { active: true });

    const results = await queryBuilder.getRawMany();

    if (!results.length) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    const post = results[0];
    const tags = results
      .filter(r => r.tag_id)
      .map(r => ({
        id: r.tag_id,
        name: r.tag_name,
        slug: r.tag_slug
      }));

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featured_image,
      status: post.status,
      publishedAt: post.published_at,
      readingTime: post.reading_time,
      viewCount: post.view_count,
      likeCount: post.like_count,
      commentCount: post.comment_count,
      shareCount: post.share_count,
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      metaKeywords: post.meta_keywords,
      ogTitle: post.og_title,
      ogDescription: post.og_description,
      ogImage: post.og_image,
      twitterTitle: post.twitter_title,
      twitterDescription: post.twitter_description,
      twitterImage: post.twitter_image,
      allowComments: post.allow_comments,
      active: post.active,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      authorId: post.author_id,
      categoryId: post.category_id,
      author: {
        id: post.user_id,
        name: post.user_name,
        avatar: post.user_avatar
      },
      category: {
        id: post.category_id,
        name: post.category_name,
        slug: post.category_slug,
        color: post.category_color
      },
      tags
    };
  }
}
