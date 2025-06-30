import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
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
import { ImageService } from 'src/shared/services/image.service';
import { NotificationsService } from '../notifications/notifications.service';

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
    private readonly imageService: ImageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Helper function để generate slug
  private generateSlug(title: string): string {
    // Vietnamese character mapping
  const vietnameseMap: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    // Uppercase versions
    'À': 'a', 'Á': 'a', 'Ạ': 'a', 'Ả': 'a', 'Ã': 'a', 'Â': 'a', 'Ầ': 'a', 'Ấ': 'a', 'Ậ': 'a', 'Ẩ': 'a', 'Ẫ': 'a',
    'Ă': 'a', 'Ằ': 'a', 'Ắ': 'a', 'Ặ': 'a', 'Ẳ': 'a', 'Ẵ': 'a',
    'È': 'e', 'É': 'e', 'Ẹ': 'e', 'Ẻ': 'e', 'Ẽ': 'e', 'Ê': 'e', 'Ề': 'e', 'Ế': 'e', 'Ệ': 'e', 'Ể': 'e', 'Ễ': 'e',
    'Ì': 'i', 'Í': 'i', 'Ị': 'i', 'Ỉ': 'i', 'Ĩ': 'i',
    'Ò': 'o', 'Ó': 'o', 'Ọ': 'o', 'Ỏ': 'o', 'Õ': 'o', 'Ô': 'o', 'Ồ': 'o', 'Ố': 'o', 'Ộ': 'o', 'Ổ': 'o', 'Ỗ': 'o',
    'Ơ': 'o', 'Ờ': 'o', 'Ớ': 'o', 'Ợ': 'o', 'Ở': 'o', 'Ỡ': 'o',
    'Ù': 'u', 'Ú': 'u', 'Ụ': 'u', 'Ủ': 'u', 'Ũ': 'u', 'Ư': 'u', 'Ừ': 'u', 'Ứ': 'u', 'Ự': 'u', 'Ử': 'u', 'Ữ': 'u',
    'Ỳ': 'y', 'Ý': 'y', 'Ỵ': 'y', 'Ỷ': 'y', 'Ỹ': 'y',
    'Đ': 'd'
  };

  let result = title.toLowerCase();
  
  // Replace Vietnamese characters
  for (const [vietnamese, latin] of Object.entries(vietnameseMap)) {
    result = result.replace(new RegExp(vietnamese.toLowerCase(), 'g'), latin);
  }
  
  return result
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Helper function để calculate reading time
  private calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async create(createPostDto: CreatePostDto, authorId: string): Promise<PostResponseDto> {
    try {
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

      if (createPostDto.featured_image) {
        const imageUrl = await this.imageService.uploadBase64Image(createPostDto.featured_image, 'featured_image_posts');
        createPostDto.featured_image = imageUrl;
      }else{
        throw new BadRequestException('Featured image is required');
      }

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

      return this.findOneBySlugIncludingDrafts(slug);

    } catch (error) {
      if (error.code === '23505' && error.constraint) {
        throw new ConflictException('Conflict slug');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async update(slug: string, updatePostDto: UpdatePostDto, userId: string, userRole: string): Promise<PostResponseDto> {
    try {
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
        const imageUrl = await this.imageService.uploadBase64Image(updatePostDto.featured_image, 'featured_image_posts');
        post.featuredImage = imageUrl;
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

      // Update tags if provided
      if (updatePostDto.tags !== undefined) {
        await this.postRepository
          .createQueryBuilder()
          .relation(Post, 'tags')
          .of(post)
          .remove(await this.postRepository
            .createQueryBuilder('post')
            .relation('tags')
            .of(post)
            .loadMany()
          );

        if (updatePostDto.tags.length > 0) {
          const newTags = await this.tagRepository.findBy({
            id: In(updatePostDto.tags)
          });
          
          if (newTags.length > 0) {
            await this.postRepository
              .createQueryBuilder()
              .relation(Post, 'tags')
              .of(post)
              .add(newTags);
          }
        }
      }

      // Return updated post
      return this.findOneBySlugIncludingDrafts(post.slug);

    } catch (error) {
      if (error.code === '23505' && error.constraint) {
        throw new ConflictException('Conflict slug');
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async delete(slug: string, userId: string, userRole: string): Promise<{ message: string, post: Post }> {
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

    return { message: 'Post deleted successfully', post };
  }

  async findAll(
    page = 1,
    limit = 10,
    category?: string,
    tag?: string,
    search?: string,
    sort?: string,
    userId?: string,
  ): Promise<PaginatedPostsResponseDto> {
    // Build the base WHERE conditions
    let whereConditions = 'post.status = $1 AND post.active = $2';
    const parameters: any[] = [PostStatus.PUBLISHED, true];
    let paramIndex = 2;

    // Add category filter
    if (category) {
      paramIndex++;
      whereConditions += ` AND category.slug = $${paramIndex}`;
      parameters.push(category);
    }

    // Add search filter
    if (search) {
      paramIndex++;
      whereConditions += ` AND (post.title ILIKE $${paramIndex} OR post.excerpt ILIKE $${paramIndex})`;
      parameters.push(`%${search}%`);
    }

    // Add tag filter - need special handling
    let tagJoinCondition = '';
    if (tag) {
      paramIndex++;
      tagJoinCondition = `
        AND post.id IN (
          SELECT DISTINCT pt.post_id 
          FROM post_tags pt 
          JOIN tags t ON CAST(t.id AS TEXT) = CAST(pt.tag_id AS TEXT)
          WHERE t.slug = $${paramIndex}
        )
      `;
      parameters.push(tag);
    }

    // Build ORDER BY clause - use correct column names
    let orderByColumn = 'post.published_at';
    if (sort === 'likes') {
      orderByColumn = 'post.like_count';
    } else if (sort === 'views') {
      orderByColumn = 'post.view_count';
    }
    const orderByDirection = 'DESC';

    // First, get the total count without LIMIT
    const countQuery = `
      SELECT COUNT(DISTINCT post.id) as count
      FROM posts post
      LEFT JOIN categories category ON CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)
      WHERE ${whereConditions} ${tagJoinCondition}
    `;

    const totalResult = await this.postRepository.query(countQuery, parameters);
    const total = parseInt(totalResult[0].count);

    // Get paginated post IDs using raw SQL - include order column in SELECT for DISTINCT
    const postIdsQuery = `
      SELECT DISTINCT post.id, ${orderByColumn}
      FROM posts post
      LEFT JOIN categories category ON CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)
      WHERE ${whereConditions} ${tagJoinCondition}
      ORDER BY ${orderByColumn} ${orderByDirection}
      LIMIT $${parameters.length + 1} OFFSET $${parameters.length + 2}
    `;

    const postIdsResult = await this.postRepository.query(
      postIdsQuery, 
      [...parameters, limit, (page - 1) * limit]
    );

    if (postIdsResult.length === 0) {
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

    const postIds = postIdsResult.map(row => row.id);

    // Now get full post data for these specific posts using QueryBuilder
    const detailQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featured_image as featured_image',
        'post.status as status',
        'post.published_at as published_at',
        'post.reading_time as reading_time',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.comment_count as comment_count',
        'post.share_count as share_count',
        'post.meta_title as meta_title',
        'post.meta_description as meta_description',
        'post.meta_keywords as meta_keywords',
        'post.og_title as og_title',
        'post.og_description as og_description',
        'post.og_image as og_image',
        'post.twitter_title as twitter_title',
        'post.twitter_description as twitter_description',
        'post.twitter_image as twitter_image',
        'post.allow_comments as allow_comments',
        'post.active as active',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.author_id as author_id',
        'post.category_id as category_id',
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
      .where('post.id IN (:...postIds)', { postIds });

    // Apply the same sorting to detail query - use correct column names
    if (sort === 'likes') {
      detailQuery.orderBy('post.like_count', 'DESC');
    } else {
      detailQuery.orderBy('post.published_at', 'DESC');
    }

    const posts = await detailQuery.getRawMany();

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

    // Convert map to array and maintain the order from postIds
    const mappedPosts = postIds.map(id => {
      const post = postsMap.get(id);
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
    });

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
    
    // First, get the post IDs with proper pagination using raw SQL
    const postIdsQuery = `
      SELECT DISTINCT post.id, post.like_count, post.published_at
      FROM posts post
      WHERE post.status = $1 AND post.active = $2 AND post.published_at >= $3
      ORDER BY post.like_count DESC, post.published_at DESC
      LIMIT $4
    `;

    const postIdsResult = await this.postRepository.query(
      postIdsQuery, 
      [PostStatus.PUBLISHED, true, thirtyDaysAgo, limit]
    );

    if (postIdsResult.length === 0) {
      return {
        posts: [],
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 0,
        },
      };
    }

    const postIds = postIdsResult.map(row => row.id);

    // Now get full post data for these specific posts
    const detailQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featured_image as featured_image',
        'post.status as status',
        'post.published_at as published_at',
        'post.reading_time as reading_time',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.comment_count as comment_count',
        'post.share_count as share_count',
        'post.meta_title as meta_title',
        'post.meta_description as meta_description',
        'post.meta_keywords as meta_keywords',
        'post.og_title as og_title',
        'post.og_description as og_description',
        'post.og_image as og_image',
        'post.twitter_title as twitter_title',
        'post.twitter_description as twitter_description',
        'post.twitter_image as twitter_image',
        'post.allow_comments as allow_comments',
        'post.active as active',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.author_id as author_id',
        'post.category_id as category_id',
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
      .where('post.id IN (:...postIds)', { postIds })
      .orderBy('post.like_count', 'DESC')
      .addOrderBy('post.published_at', 'DESC');

    const posts = await detailQuery.getRawMany();

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

    // Convert map to array and maintain the order from postIds
    const mappedPosts = postIds.map(id => {
      const post = postsMap.get(id);
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
    });

    return {
      posts: mappedPosts,
      pagination: {
        currentPage: 0,
        totalPages: 1,
        totalItems: mappedPosts.length,
        itemsPerPage: mappedPosts.length,
      },
    };
  }

  async getRecentPost(page = 1, limit = 10): Promise<PaginatedPostsResponseDto> {
    // Get total count first
    const totalQuery = `
      SELECT COUNT(DISTINCT post.id) as count
      FROM posts post
      WHERE post.status = $1 AND post.active = $2
    `;

    const totalResult = await this.postRepository.query(totalQuery, [PostStatus.PUBLISHED, true]);
    const total = parseInt(totalResult[0].count);

    // Get paginated post IDs using raw SQL
    const postIdsQuery = `
      SELECT DISTINCT post.id, post.published_at
      FROM posts post
      WHERE post.status = $1 AND post.active = $2
      ORDER BY post.published_at DESC
      LIMIT $3 OFFSET $4
    `;

    const postIdsResult = await this.postRepository.query(
      postIdsQuery, 
      [PostStatus.PUBLISHED, true, limit, (page - 1) * limit]
    );

    if (postIdsResult.length === 0) {
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

    const postIds = postIdsResult.map(row => row.id);

    // Now get full post data for these specific posts
    const detailQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featured_image as featured_image',
        'post.status as status',
        'post.published_at as published_at',
        'post.reading_time as reading_time',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.comment_count as comment_count',
        'post.share_count as share_count',
        'post.meta_title as meta_title',
        'post.meta_description as meta_description',
        'post.meta_keywords as meta_keywords',
        'post.og_title as og_title',
        'post.og_description as og_description',
        'post.og_image as og_image',
        'post.twitter_title as twitter_title',
        'post.twitter_description as twitter_description',
        'post.twitter_image as twitter_image',
        'post.allow_comments as allow_comments',
        'post.active as active',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.author_id as author_id',
        'post.category_id as category_id',
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
      .where('post.id IN (:...postIds)', { postIds })
      .orderBy('post.published_at', 'DESC');

    const posts = await detailQuery.getRawMany();

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

    // Convert map to array and maintain the order from postIds
    const mappedPosts = postIds.map(id => {
      const post = postsMap.get(id);
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
    });

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

  async getPostByUser(userId: string, page: number, limit: number, category: string, tag: string, search: string, sort: string, status: string): Promise<any> {
    // First, get the post IDs with proper pagination (without tags to avoid duplication)
    const baseQueryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.categoryId AS TEXT)')
      .select(['post.id as post_id'])
      .where('post.authorId = :userId', { userId })
      .andWhere('post.active = :active', { active: true });

    if(status !== 'all') {
      
      baseQueryBuilder.andWhere('post.status = :status', { status });
    }

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

    // Add sorting
    let orderByField = 'post.publishedAt';
    let orderDirection: 'ASC' | 'DESC' = 'DESC';
    
    if (sort) {
      switch (sort) {
        case 'oldest':
          orderByField = 'post.publishedAt';
          orderDirection = 'ASC';
          break;
        case 'newest':
          orderByField = 'post.publishedAt';
          orderDirection = 'DESC';
          break;
        case 'most-viewed':
          orderByField = 'post.viewCount';
          orderDirection = 'DESC';
          break;
        case 'most-liked':
          orderByField = 'post.likeCount';
          orderDirection = 'DESC';
          break;
        case 'title-asc':
          orderByField = 'post.title';
          orderDirection = 'ASC';
          break;
        case 'title-desc':
          orderByField = 'post.title';
          orderDirection = 'DESC';
          break;
        default:
          orderByField = 'post.publishedAt';
          orderDirection = 'DESC';
      }
    }

    // Get post IDs for current page
    const postIds = await baseQueryBuilder
      .orderBy(orderByField, orderDirection)
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
      .orderBy(orderByField, orderDirection);

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

  async getPublishedPostsByUserId(userId: string, page = 1, limit = 10): Promise<PaginatedPostsResponseDto> {
    // Get total count first
    const totalQuery = `
      SELECT COUNT(DISTINCT post.id) as count
      FROM posts post
      WHERE post.author_id = $1 AND post.status = $2 AND post.active = $3
    `;

    const totalResult = await this.postRepository.query(totalQuery, [userId, PostStatus.PUBLISHED, true]);
    const total = parseInt(totalResult[0].count);

    // Get paginated post IDs using raw SQL
    const postIdsQuery = `
      SELECT DISTINCT post.id, post.published_at
      FROM posts post
      WHERE post.author_id = $1 AND post.status = $2 AND post.active = $3
      ORDER BY post.published_at DESC
      LIMIT $4 OFFSET $5
    `;

    const postIdsResult = await this.postRepository.query(
      postIdsQuery, 
      [userId, PostStatus.PUBLISHED, true, limit, (page - 1) * limit]
    );

    if (postIdsResult.length === 0) {
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

    const postIds = postIdsResult.map(row => row.id);

    // Now get full post data for these specific posts
    const detailQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featured_image as featured_image',
        'post.status as status',
        'post.published_at as published_at',
        'post.reading_time as reading_time',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.comment_count as comment_count',
        'post.share_count as share_count',
        'post.meta_title as meta_title',
        'post.meta_description as meta_description',
        'post.meta_keywords as meta_keywords',
        'post.og_title as og_title',
        'post.og_description as og_description',
        'post.og_image as og_image',
        'post.twitter_title as twitter_title',
        'post.twitter_description as twitter_description',
        'post.twitter_image as twitter_image',
        'post.allow_comments as allow_comments',
        'post.active as active',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.author_id as author_id',
        'post.category_id as category_id',
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
      .where('post.id IN (:...postIds)', { postIds })
      .orderBy('post.published_at', 'DESC');

    const posts = await detailQuery.getRawMany();

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

    // Convert map to array and maintain the order from postIds
    const mappedPosts = postIds.map(id => {
      const post = postsMap.get(id);
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
    });

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
    sort?: string,
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

    // Add sorting
    let orderByField = 'saved_post.saved_at';
    let orderDirection: 'ASC' | 'DESC' = 'DESC';
    
    if (sort) {
      switch (sort) {
        case 'oldest':
          orderByField = 'post.publishedAt';
          orderDirection = 'ASC';
          break;
        case 'newest':
          orderByField = 'post.publishedAt';
          orderDirection = 'DESC';
          break;
        case 'most-viewed':
          orderByField = 'post.viewCount';
          orderDirection = 'DESC';
          break;
        case 'most-liked':
          orderByField = 'post.likeCount';
          orderDirection = 'DESC';
          break;
        case 'title-asc':
          orderByField = 'post.title';
          orderDirection = 'ASC';
          break;
        case 'title-desc':
          orderByField = 'post.title';
          orderDirection = 'DESC';
          break;
        case 'saved-newest':
          orderByField = 'saved_post.saved_at';
          orderDirection = 'DESC';
          break;
        case 'saved-oldest':
          orderByField = 'saved_post.saved_at';
          orderDirection = 'ASC';
          break;
        default:
          orderByField = 'saved_post.saved_at';
          orderDirection = 'DESC';
      }
    }

    // Get saved post IDs for current page
    const savedPostIds = await baseQueryBuilder
      .orderBy(orderByField, orderDirection)
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
      .orderBy(orderByField, orderDirection);

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

  async getPostCountByCategory(categoryId: string): Promise<number> {
    const result = await this.postRepository
      .createQueryBuilder('post')
      .select('COUNT(post.id) as total_posts')
      .where('post.categoryId = :categoryId', { categoryId })
      .andWhere('post.active = :active', { active: true })
      .getRawOne();

    return parseInt(result.total_posts) || 0;
  }

  async getAdminPosts(
    page = 1,
    limit = 7,
    status?: string,
    search?: string,
    active?: string,
  ): Promise<any> {
    // Build query with simple conditions
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.status as status',
        'post.published_at as published_at',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.featured_image as featured_image',
        'user.id as author_id',
        'user.name as author_name',
        'user.avatar as author_avatar',
        'category.id as category_id',
        'category.name as category_name',
        'category.color as category_color'
      ])
      .where('post.active = :active', { active: active });

    // Filter by status if provided
    if (status && status !== 'all') {
      queryBuilder.andWhere('post.status = :status', { status });
    }

    // Filter by search if provided
    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.excerpt ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Get paginated results
    const posts = await queryBuilder
      .orderBy('post.created_at', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    // Format response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      status: post.status,
      publishedAt: post.published_at,
      viewCount: post.view_count,
      likeCount: post.like_count,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      featuredImage: post.featured_image,
      author: {
        id: post.author_id,
        name: post.author_name,
        avatar: post.author_avatar
      },
      category: {
        id: post.category_id,
        name: post.category_name,
        color: post.category_color
      }
    }));

    return {
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getTopPost(page = 1, limit = 10, sort = 'likes'): Promise<PaginatedPostsResponseDto> {
    // Tính ngày 30 ngày trước cho featured posts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Build the base WHERE conditions for top posts
    let whereConditions = 'post.status = $1 AND post.active = $2';
    const parameters: any[] = [PostStatus.PUBLISHED, true];
    
    // For top posts, we might want to include all time or recent posts
    if (sort === 'likes') {
      // Include posts from last 30 days for better relevance
      whereConditions += ' AND post.published_at >= $3';
      parameters.push(thirtyDaysAgo);
    }
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT post.id) as count
      FROM posts post
      WHERE ${whereConditions}
    `;
    
    const totalResult = await this.postRepository.query(countQuery, parameters);
    const total = parseInt(totalResult[0].count);

    // Determine sort column
    let orderByColumn = 'post.like_count';
    if (sort === 'views') {
      orderByColumn = 'post.view_count';
    }

    // Get paginated post IDs
    const postIdsQuery = `
      SELECT DISTINCT post.id, ${orderByColumn}, post.published_at
      FROM posts post
      WHERE ${whereConditions}
      ORDER BY ${orderByColumn} DESC, post.published_at DESC
      LIMIT $${parameters.length + 1} OFFSET $${parameters.length + 2}
    `;

    const postIdsResult = await this.postRepository.query(
      postIdsQuery, 
      [...parameters, limit, (page - 1) * limit]
    );

    if (postIdsResult.length === 0) {
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

    const postIds = postIdsResult.map(row => row.id);

    // Get full post data
    const detailQuery = this.postRepository
      .createQueryBuilder('post')
      .leftJoin('users', 'user', 'CAST(user.id AS TEXT) = CAST(post.author_id AS TEXT)')
      .leftJoin('categories', 'category', 'CAST(category.id AS TEXT) = CAST(post.category_id AS TEXT)')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.post_id AS TEXT) = CAST(post.id AS TEXT)')
      .leftJoin('tags', 'tag', 'CAST(tag.id AS TEXT) = CAST(post_tags.tag_id AS TEXT)')
      .select([
        'post.id as id',
        'post.title as title',
        'post.slug as slug',
        'post.excerpt as excerpt',
        'post.content as content',
        'post.featured_image as featured_image',
        'post.status as status',
        'post.published_at as published_at',
        'post.reading_time as reading_time',
        'post.view_count as view_count',
        'post.like_count as like_count',
        'post.comment_count as comment_count',
        'post.share_count as share_count',
        'post.meta_title as meta_title',
        'post.meta_description as meta_description',
        'post.meta_keywords as meta_keywords',
        'post.og_title as og_title',
        'post.og_description as og_description',
        'post.og_image as og_image',
        'post.twitter_title as twitter_title',
        'post.twitter_description as twitter_description',
        'post.twitter_image as twitter_image',
        'post.allow_comments as allow_comments',
        'post.active as active',
        'post.created_at as created_at',
        'post.updated_at as updated_at',
        'post.author_id as author_id',
        'post.category_id as category_id',
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
      .where('post.id IN (:...postIds)', { postIds });

    // Apply sorting
    if (sort === 'views') {
      detailQuery.orderBy('post.view_count', 'DESC');
    } else {
      detailQuery.orderBy('post.like_count', 'DESC');
    }
    detailQuery.addOrderBy('post.published_at', 'DESC');

    const posts = await detailQuery.getRawMany();

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

    // Convert map to array and maintain order
    const mappedPosts = postIds.map(id => {
      const post = postsMap.get(id);
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
    });

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

  async restorePost(slug: string, userId: string, userRole: string): Promise<{ message: string }> {
    const post = await this.postRepository.findOne({ where: { slug } });
    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }
    if (userRole !== 'admin') {
      throw new ForbiddenException('You are not authorized to restore this post');
    }
    post.active = true;
    await this.postRepository.save(post);
    return { message: 'Post restored successfully' };
  }
}
