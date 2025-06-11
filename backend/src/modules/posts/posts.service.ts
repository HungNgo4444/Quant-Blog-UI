import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { Post, PostStatus } from '../../entities/post.entity';
import { PaginatedPostsResponseDto, PostResponseDto, CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { View } from '../../entities/view.entity';
import { Like } from '../../entities/like.entity';
import { SavedPost } from '../../entities/saved-post.entity';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(View)
    private readonly viewRepository: Repository<View>,
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(SavedPost)
    private readonly savedPostRepository: Repository<SavedPost>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  // Helper function để generate slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim() + '-' + Date.now(); // Add timestamp for uniqueness
  }

  // Helper function để calculate reading time
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostResponseDto> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createPostDto.categoryId }
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify tags exist
    let tags: Tag[] = [];
    if (createPostDto.tags && createPostDto.tags.length > 0) {
      tags = await this.tagRepository.findBy({
        id: In(createPostDto.tags)
      });

      if (tags.length !== createPostDto.tags.length) {
        throw new NotFoundException('One or more tags not found');
      }
    }

    // Generate slug
    const slug = this.generateSlug(createPostDto.title);

    // Calculate reading time
    const readingTime = this.calculateReadingTime(createPostDto.content);

    // Create post
    const post = this.postRepository.create({
      title: createPostDto.title,
      slug,
      content: createPostDto.content,
      excerpt: createPostDto.excerpt || createPostDto.content.substring(0, 200) + '...',
      authorId,
      categoryId: createPostDto.categoryId,
      featuredImage: createPostDto.featured_image,
      status: createPostDto.published ? PostStatus.PUBLISHED : PostStatus.DRAFT,
      publishedAt: createPostDto.published ? new Date() : null,
      readingTime,
      metaTitle: createPostDto.seoTitle || createPostDto.title,
      metaDescription: createPostDto.seoDescription || createPostDto.excerpt,
      metaKeywords: createPostDto.metaKeywords,
      ogTitle: createPostDto.ogTitle || createPostDto.title,
      ogDescription: createPostDto.ogDescription || createPostDto.excerpt,
      ogImage: createPostDto.ogImage || createPostDto.featured_image,
      twitterTitle: createPostDto.twitterTitle || createPostDto.title,
      twitterDescription: createPostDto.twitterDescription || createPostDto.excerpt,
      twitterImage: createPostDto.twitterImage || createPostDto.featured_image,
      allowComments: createPostDto.allowComments !== false,
      active: true,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    });

    const savedPost = await this.postRepository.save(post);

    // Associate tags
    if (tags.length > 0) {
      await this.postRepository
        .createQueryBuilder()
        .relation(Post, 'tags')
        .of(savedPost)
        .add(tags);
    }

    // Return formatted response using method that includes drafts
    return this.findOneBySlugIncludingDrafts(slug);
  }

  async update(slug: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<PostResponseDto> {
    // Find the post
    const post = await this.postRepository.findOne({
      where: { slug, active: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions
    if (userRole !== 'admin' && post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    // Verify category if provided
    if (updatePostDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updatePostDto.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    // Verify tags if provided
    let tags: Tag[] = [];
    if (updatePostDto.tags) {
      if (updatePostDto.tags.length > 0) {
        tags = await this.tagRepository.findBy({
          id: In(updatePostDto.tags)
        });

        if (tags.length !== updatePostDto.tags.length) {
          throw new NotFoundException('One or more tags not found');
        }
      }
    }

    // Update post fields
    if (updatePostDto.title) {
      post.title = updatePostDto.title;
      // Regenerate slug if title changed
      post.slug = this.generateSlug(updatePostDto.title);
    }

    if (updatePostDto.content) {
      post.content = updatePostDto.content;
      post.readingTime = this.calculateReadingTime(updatePostDto.content);
    }

    if (updatePostDto.excerpt !== undefined) {
      post.excerpt = updatePostDto.excerpt;
    }

    if (updatePostDto.categoryId) {
      post.categoryId = updatePostDto.categoryId;
    }

    if (updatePostDto.featured_image !== undefined) {
      post.featuredImage = updatePostDto.featured_image;
    }

    if (updatePostDto.published !== undefined) {
      post.status = updatePostDto.published ? PostStatus.PUBLISHED : PostStatus.DRAFT;
      if (updatePostDto.published && !post.publishedAt) {
        post.publishedAt = new Date();
      }
    }

    // Update SEO fields
    if (updatePostDto.seoTitle !== undefined) {
      post.metaTitle = updatePostDto.seoTitle;
    }
    if (updatePostDto.seoDescription !== undefined) {
      post.metaDescription = updatePostDto.seoDescription;
    }
    if (updatePostDto.metaKeywords !== undefined) {
      post.metaKeywords = updatePostDto.metaKeywords;
    }
    if (updatePostDto.ogTitle !== undefined) {
      post.ogTitle = updatePostDto.ogTitle;
    }
    if (updatePostDto.ogDescription !== undefined) {
      post.ogDescription = updatePostDto.ogDescription;
    }
    if (updatePostDto.ogImage !== undefined) {
      post.ogImage = updatePostDto.ogImage;
    }
    if (updatePostDto.twitterTitle !== undefined) {
      post.twitterTitle = updatePostDto.twitterTitle;
    }
    if (updatePostDto.twitterDescription !== undefined) {
      post.twitterDescription = updatePostDto.twitterDescription;
    }
    if (updatePostDto.twitterImage !== undefined) {
      post.twitterImage = updatePostDto.twitterImage;
    }
    if (updatePostDto.allowComments !== undefined) {
      post.allowComments = updatePostDto.allowComments;
    }

    // Save updated post
    await this.postRepository.save(post);

    // Update tags if provided (simplified approach)
    if (updatePostDto.tags !== undefined) {
      // For now, we'll skip the complex tag update logic
      // This can be implemented with a proper junction table setup later
      console.log('Tag update requested for post:', post.id, 'with tags:', updatePostDto.tags);
    }

    // Return updated post
    return this.findOneBySlugIncludingDrafts(post.slug);
  }

  async delete(slug: string, userId: string, userRole: string): Promise<{ message: string }> {
    // Find the post
    const post = await this.postRepository.findOne({
      where: { slug, active: true }
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check permissions
    if (userRole !== 'admin' && post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Soft delete (set active to false)
    await this.postRepository.update(post.id, { active: false });

    return { message: 'Post deleted successfully' };
  }

  async findAll(
    page = 1,
    limit = 10,
    category?: string,
    tag?: string,
    search?: string,
    userId?: string,
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
        '(post.title ILIKE :search OR post.excerpt ILIKE :search)',
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
    posts.forEach(async raw => {
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

  async getFeaturedPost(
    limit = 10,
  ): Promise<PaginatedPostsResponseDto> {
    // Tính ngày 30 ngày trước
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
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
      .andWhere('post.active = :active', { active: true })
      .andWhere('post.publishedAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .orderBy('post.likeCount', 'DESC')
      .addOrderBy('post.publishedAt', 'DESC');

    // Get total count
    const total = await queryBuilder.getCount();

    // Get posts
    const posts = await queryBuilder
      .limit(limit)
      .getRawMany();

    // Group posts by ID to handle tags
    const postsMap = new Map();
    posts.forEach(async raw => {
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
        currentPage: 0,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findOneBySlugIncludingDrafts(slug: string): Promise<PostResponseDto> {
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

  async trackView(slug: string, ipAddress: string, userAgent: string): Promise<{ success: boolean; viewCount: number }> {
    // Tìm post theo slug
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, active: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Kiểm tra xem đã có view từ IP này trong 24h chưa (để tránh spam)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingView = await this.viewRepository.findOne({
      where: {
        postId: post.id,
        ipAddress,
        viewedAt: MoreThan(twentyFourHoursAgo)
      }
    });

    if (!existingView) {
      // Tạo view record mới
      const view = this.viewRepository.create({
        postId: post.id,
        ipAddress,
        userAgent,
      });
      await this.viewRepository.save(view);

      // Cập nhật view count
      await this.postRepository.update(post.id, {
        viewCount: post.viewCount + 1
      });

      return {
        success: true,
        viewCount: post.viewCount + 1
      };
    }

    return {
      success: true,
      viewCount: post.viewCount
    };
  }

  async toggleLike(slug: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    // Tìm post theo slug
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, active: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Kiểm tra xem user đã like chưa
    const existingLike = await this.likeRepository.findOne({
      where: {
        postId: post.id,
        userId
      }
    });

    if (existingLike) {
      // Unlike - xóa like
      await this.likeRepository.remove(existingLike);
      await this.postRepository.update(post.id, {
        likeCount: Math.max(0, post.likeCount - 1)
      });

      return {
        liked: false,
        likeCount: Math.max(0, post.likeCount - 1)
      };
    } else {
      // Like - tạo like mới
      const like = this.likeRepository.create({
        postId: post.id,
        userId
      });
      await this.likeRepository.save(like);
      await this.postRepository.update(post.id, {
        likeCount: post.likeCount + 1
      });

      return {
        liked: true,
        likeCount: post.likeCount + 1
      };
    }
  }

  async getLikeStatus(slug: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    // Tìm post theo slug
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, active: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Kiểm tra xem user đã like chưa
    const existingLike = await this.likeRepository.findOne({
      where: {
        postId: post.id,
        userId
      }
    });

    return {
      liked: !!existingLike,
      likeCount: post.likeCount
    };
  }

  async getPostByUser(userId: string, page: number, limit: number, category: string, tag: string, search: string, request: any): Promise<any> {
    // First, get the post IDs with proper pagination (without tags to avoid duplication)
    const baseQueryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.categoryId AS TEXT)')
      .select(['post.id as post_id'])
      .where('post.authorId = :userId', { userId })
      .andWhere('post.active = :active', { active: true });

    if (category) {
      baseQueryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    if (tag) {
      baseQueryBuilder
        .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
        .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
        .andWhere('tag.slug = :tagSlug', { tagSlug: tag });
    }

    if (search) {
      baseQueryBuilder.andWhere(
        '(post.title ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count
    const total = await baseQueryBuilder.getCount();

    // Get post IDs for current page
    const postIds = await baseQueryBuilder
      .orderBy('post.publishedAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    if (postIds.length === 0) {
      return {
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    }

    // Now get full post data with tags for these specific post IDs
    const detailQueryBuilder = this.postRepository
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
      .where('post.id IN (:...postIds)', { postIds: postIds.map(p => p.post_id) })
      .orderBy('post.publishedAt', 'DESC');

    const posts = await detailQueryBuilder.getRawMany();

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

    // Maintain the order from the original query
    const mappedPosts = postIds.map(({ post_id }) => {
      const post = postsMap.get(post_id);
      if (!post) {
        console.warn(`Post with id ${post_id} not found in postsMap`);
        return null;
      }
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
        author: post.author,
        category: post.category,
        tags: post.tags
      };
    }).filter(post => post !== null);

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

  async getSavedPostsByUser(
    userId: string,
    page = 1,
    limit = 10,
    category?: string,
    tag?: string,
    search?: string,
  ): Promise<PaginatedPostsResponseDto> {
    // First, get the saved post IDs with proper pagination (without tags to avoid duplication)
    const baseQueryBuilder = this.savedPostRepository
      .createQueryBuilder('saved_post')
      .leftJoin('posts', 'post', 'CAST(post.id AS TEXT) = CAST(saved_post.post_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.categoryId AS TEXT)')
      .select(['post.id as post_id', 'saved_post.saved_at as saved_at'])
      .where('saved_post.user_id = :userId', { userId })
      .andWhere('post.status = :status', { status: PostStatus.PUBLISHED })
      .andWhere('post.active = :active', { active: true });

    if (category) {
      baseQueryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: category });
    }

    if (tag) {
      baseQueryBuilder
        .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
        .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
        .andWhere('tag.slug = :tagSlug', { tagSlug: tag });
    }

    if (search) {
      baseQueryBuilder.andWhere(
        '(post.title ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Get total count
    const total = await baseQueryBuilder.getCount();

    // Get saved post IDs for current page
    const savedPostIds = await baseQueryBuilder
      .orderBy('saved_post.saved_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();
    

    if (savedPostIds.length === 0) {
      return {
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      };
    }

    // Now get full post data with tags for these specific saved posts
    const detailQueryBuilder = this.savedPostRepository
      .createQueryBuilder('saved_post')
      .leftJoin('posts', 'post', 'CAST(post.id AS TEXT) = CAST(saved_post.post_id AS TEXT)')
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
        'tag.slug as tag_slug',
        'saved_post.saved_at as saved_at'
      ])
      .where('post.id IN (:...postIds)', { postIds: savedPostIds.map(p => p.post_id) })
      .orderBy('saved_post.saved_at', 'DESC');

    const posts = await detailQueryBuilder.getRawMany();

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

    // Maintain the order from the original query
    const mappedPosts = savedPostIds.map(({ post_id }) => {
      const post = postsMap.get(post_id);
      if (!post) {
        console.warn(`Post with id ${post_id} not found in postsMap`);
        return null;
      }
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
        author: post.author,
        category: post.category,
        tags: post.tags,
        savedAt: post.saved_at
      };
    }).filter(post => post !== null);
    

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

  async toggleSavePost(slug: string, userId: string): Promise<{ saved: boolean; message: string }> {
    // Tìm post theo slug
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, active: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Kiểm tra xem user đã save post chưa
    const existingSavedPost = await this.savedPostRepository.findOne({
      where: {
        postId: post.id,
        userId
      }
    });

    if (existingSavedPost) {
      // Unsave - xóa saved post
      await this.savedPostRepository.remove(existingSavedPost);
      return {
        saved: false,
        message: 'Đã bỏ lưu bài viết'
      };
    } else {
      // Save - tạo saved post mới
      const savedPost = this.savedPostRepository.create({
        postId: post.id,
        userId
      });
      await this.savedPostRepository.save(savedPost);
      return {
        saved: true,
        message: 'Đã lưu bài viết'
      };
    }
  }

  async getSaveStatus(slug: string, userId: string): Promise<{ saved: boolean }> {
    // Tìm post theo slug
    const post = await this.postRepository.findOne({
      where: { slug, status: PostStatus.PUBLISHED, active: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Kiểm tra xem user đã save post chưa
    const existingSavedPost = await this.savedPostRepository.findOne({
      where: {
        postId: post.id,
        userId
      }
    });

    return {
      saved: !!existingSavedPost
    };
  }

  async getBulkSaveStatus(slugs: string[], userId: string): Promise<{ [slug: string]: boolean }> {
    if (!slugs || slugs.length === 0) {
      return {};
    }

    // Tìm các posts theo slugs
    const posts = await this.postRepository.find({
      where: {
        slug: In(slugs),
        status: PostStatus.PUBLISHED,
        active: true
      },
      select: ['id', 'slug']
    });

    if (posts.length === 0) {
      return {};
    }

    const postIds = posts.map(post => post.id);

    // Tìm tất cả saved posts cho user này với các post IDs
    const savedPosts = await this.savedPostRepository.find({
      where: {
        postId: In(postIds),
        userId
      },
      select: ['postId']
    });

    // Tạo map postId -> saved status
    const savedPostIds = new Set(savedPosts.map(sp => sp.postId));

    // Tạo result object với slug làm key
    const result: { [slug: string]: boolean } = {};
    posts.forEach(post => {
      result[post.slug] = savedPostIds.has(post.id);
    });

    return result;
  }

  async getUserPostsStats(userId: string): Promise<{ totalPosts: number; totalViews: number }> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .select([
        'COUNT(post.id) as total_posts',
        'COALESCE(SUM(post.viewCount), 0) as total_views'
      ])
      .where('post.authorId = :userId', { userId })
      .andWhere('post.active = :active', { active: true })
      .getRawOne();

    return {
      totalPosts: parseInt(result.total_posts) || 0,
      totalViews: parseInt(result.total_views) || 0
    };
  }

}
