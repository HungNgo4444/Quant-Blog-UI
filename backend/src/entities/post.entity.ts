import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import { View } from './view.entity';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('posts')
@Index(['slug'], { unique: true })
@Index(['status', 'publishedAt'])
@Index(['authorId', 'status'])
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text' })
  excerpt: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @Column({ name: 'reading_time', default: 0 })
  readingTime: number;

  @Column({ name: 'view_count', default: 0 })
  viewCount: number;

  @Column({ name: 'like_count', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', default: 0 })
  commentCount: number;

  @Column({ name: 'share_count', default: 0 })
  shareCount: number;

  // SEO Fields
  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription: string;

  @Column({ name: 'meta_keywords', nullable: true })
  metaKeywords: string;

  // Social Media
  @Column({ name: 'og_title', nullable: true })
  ogTitle: string;

  @Column({ name: 'og_description', nullable: true })
  ogDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ name: 'twitter_title', nullable: true })
  twitterTitle: string;

  @Column({ name: 'twitter_description', nullable: true })
  twitterDescription: string;

  @Column({ name: 'twitter_image', nullable: true })
  twitterImage: string;

  @Column({ name: 'allow_comments', default: true })
  allowComments: boolean;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Foreign Keys
  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  // Relations
  // @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  // author: User;

  // @ManyToOne(() => Category, (category) => category.posts, { onDelete: 'SET NULL' })
  // category: Category;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  // @OneToMany(() => Comment, (comment) => comment.post)
  // comments: Comment[];

  // @OneToMany(() => Like, (like) => like.post)
  // likes: Like[];

  // @OneToMany(() => View, (view) => view.post)
  // views: View[];
} 