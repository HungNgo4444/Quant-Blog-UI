import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, CommentResponseDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Tạo comment mới' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() request: any,
  ): Promise<CommentResponseDto> {
    const userId = request.user.id;
    const userAgent = request.get('User-Agent') || '';
    const ipAddress = request.ip || request.connection.remoteAddress || '';
    
    return this.commentsService.create(createCommentDto, userId, userAgent, ipAddress);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Lấy comments theo post ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findByPost(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ comments: CommentResponseDto[]; total: number; pagination: any }> {
    const result = await this.commentsService.findByPostId(postId, page, limit);
    return {
      ...result,
      pagination: {
        currentPage: page || 1,
        totalPages: Math.ceil(result.total / (limit || 10)),
        totalItems: result.total,
        itemsPerPage: limit || 10,
      }
    };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả comments' })
  @ApiResponse({ status: 200, type: [CommentResponseDto] })
  async findAll(): Promise<CommentResponseDto[]> {
    return this.commentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy comment theo ID' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cập nhật comment' })
  @ApiResponse({ status: 200, type: CommentResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async update(
    @Param('id') id: string, 
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request: any,
  ): Promise<CommentResponseDto> {
    const userId = request.user.id;
    return this.commentsService.update(id, updateCommentDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Xóa comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async remove(
    @Param('id') id: string,
    @Req() request: any,
  ): Promise<{ message: string }> {
    const userId = request.user.id;
    await this.commentsService.remove(id, userId);
    return { message: 'Comment deleted successfully' };
  }
}
