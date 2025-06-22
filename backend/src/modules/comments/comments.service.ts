import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, TreeRepository } from 'typeorm';
import { CreateCommentDto, CommentResponseDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentStatus } from '../../entities/comment.entity';
import { Post, PostStatus } from '../../entities/post.entity';
import { ImageService } from 'src/shared/services/image.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: TreeRepository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly imageService: ImageService,
    private readonly userService: UsersService
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string, userAgent?: string, ipAddress?: string): Promise<any> {
    // Kiểm tra post có tồn tại và cho phép comment không
    const post = await this.postRepository.findOne({
      where: { 
        id: createCommentDto.postId, 
        status: PostStatus.PUBLISHED, 
        active: true,
        allowComments: true
      }
    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại hoặc không cho phép comment');
    }

    let parentComment = null;
    if (createCommentDto.parentId) {
      parentComment = await this.commentRepository.findOne({
        where: { 
          id: createCommentDto.parentId,
          postId: createCommentDto.postId,
          status: CommentStatus.APPROVED 
        }
      });

      if (!parentComment) {
        throw new BadRequestException('Comment cha không tồn tại');
      }
    }

    let commentImageUrl = null;
    if(createCommentDto.imageUrl){
      commentImageUrl= await this.imageService.uploadBase64Image(createCommentDto.imageUrl, 'comment');
    }

    // Tạo comment mới
    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      postId: createCommentDto.postId,
      userId,
      imageUrl: commentImageUrl,
      userAgent,
      ipAddress,
      parent: parentComment,
      parentId: parentComment?.id,
      status: CommentStatus.APPROVED, // Auto approve for now
    });

    const savedComment = await this.commentRepository.save(comment);

    // Cập nhật reply count cho parent comment
    if (parentComment) {
      await this.commentRepository.update(parentComment.id, {
        replyCount: parentComment.replyCount + 1
      });
    }

    // Cập nhật comment count cho post
    await this.postRepository.update(post.id, {
      commentCount: post.commentCount + 1
    });

    const userInfo = await this.userService.getById(savedComment.userId);

    return {
      id: savedComment.id,
      content: savedComment.content,
      status: savedComment.status,
      likeCount: savedComment.likeCount,
      replyCount: savedComment.replyCount,
      imageUrl: savedComment.imageUrl,
      createdAt: savedComment.createdAt,
      updatedAt: savedComment.updatedAt,
      author: {
        id: userInfo.id,
        name: userInfo.name || `User ${userInfo.id.substring(0, 8)}`,
        avatar: userInfo.avatar || null
      },
      post: {
        authorId: post.authorId,
        id: post.id,
        title: post.title,
        slug: post.slug,
      }
    };
  }

  async findByPostId(postId: string, page = 1, limit = 10): Promise<{ comments: CommentResponseDto[]; total: number }> {
    // Kiểm tra post có tồn tại không
    const post = await this.postRepository.findOne({
      where: { id: postId, status: PostStatus.PUBLISHED, active: true}

    });

    if (!post) {
      throw new NotFoundException('Bài viết không tồn tại');
    }

    // Lấy root comments (không có parent) với pagination
    const [rootComments, total] = await this.commentRepository.findAndCount({
      where: {
        postId,
        parentId: IsNull(),
        status: CommentStatus.APPROVED,
        active: true
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Load children cho mỗi root comment
    const commentsWithChildren = await Promise.all(
      rootComments.map(async (comment) => {
        const commentWithChildren = await this.commentRepository.findDescendantsTree(comment);
        return this.mapToResponseDtoWithChildren(commentWithChildren);
      })
    );

    return {
      comments: commentsWithChildren,
      total
    };
  }

  async findAll(): Promise<CommentResponseDto[]> {
    const comments = await this.commentRepository.find({
      where: { status: CommentStatus.APPROVED, active: true },
      order: { createdAt: 'DESC' }
    });

    return Promise.all(comments.map(comment => this.mapToResponseDto(comment)));
  }

  async findOne(id: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id, status: CommentStatus.APPROVED, active: true }
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID "${id}" not found`);
    }

    return this.mapToResponseDto(comment);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<CommentResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: { id, userId, active: true }
    });

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại hoặc bạn không có quyền sửa');
    }

    // Chỉ cho phép sửa trong 15 phút sau khi tạo
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (comment.createdAt < fifteenMinutesAgo) {
      throw new BadRequestException('Chỉ có thể sửa comment trong 15 phút đầu');
    }

    await this.commentRepository.update(id, {
      content: updateCommentDto.content,
      imageUrl: updateCommentDto.imageUrl,
    });

    const updatedComment = await this.commentRepository.findOne({ where: { id } });
    return this.mapToResponseDto(updatedComment);
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id, userId, active: true }
    });

    if (!comment) {
      throw new NotFoundException('Comment không tồn tại hoặc bạn không có quyền xóa');
    }

    // Soft delete
    await this.commentRepository.update(id, { active: false });

    // Cập nhật comment count cho post
    const post = await this.postRepository.findOne({ where: { id: comment.postId } });
    if (post) {
      await this.postRepository.update(post.id, {
        commentCount: Math.max(0, post.commentCount - 1)
      });
    }
  }

  private async mapToResponseDto(comment: Comment): Promise<CommentResponseDto> {
    // Lấy thông tin user từ database
    const userInfo = await this.userService.getById(comment.userId);

    return {
      id: comment.id,
      content: comment.content,
      status: comment.status,
      likeCount: comment.likeCount,
      replyCount: comment.replyCount,
      imageUrl: comment.imageUrl,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: userInfo.id,
        name: userInfo.name || `User ${userInfo.id.substring(0, 8)}`,
        avatar: userInfo.avatar || null
      }
    };
  }

  private async mapToResponseDtoWithChildren(comment: Comment): Promise<CommentResponseDto> {
    const dto = await this.mapToResponseDto(comment);
    
    if (comment.children && comment.children.length > 0) {
      dto.children = await Promise.all(
        comment.children.map(child => this.mapToResponseDtoWithChildren(child))
      );
    }

    return dto;
  }

}
