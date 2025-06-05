import { Controller, Get, Post, Param, Query, Req, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PaginatedPostsResponseDto, PostResponseDto } from './dto/post.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('posts')
@Controller('/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all published posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.findAll(page, limit, category, tag, search);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by slug' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postsService.findOneBySlug(slug);
  }

  @Get(':slug/like-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if current user has liked the post' })
  @ApiResponse({ status: 200, description: 'Like status retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLikeStatus(
    @Param('slug') slug: string,
    @Req() request: any,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getLikeStatus(slug, userId);
  }

  @Post(':slug/view')
  @ApiOperation({ summary: 'Track post view' })
  @ApiResponse({ status: 200, description: 'View tracked successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async trackView(
    @Param('slug') slug: string,
    @Req() request: Request,
  ): Promise<{ success: boolean; viewCount: number }> {
    const userAgent = request.get('User-Agent') || '';
    const ipAddress = request.ip || request.connection.remoteAddress || '';
    
    return this.postsService.trackView(slug, ipAddress, userAgent);
  }

  @Post(':slug/like')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like or unlike a post' })
  @ApiResponse({ status: 200, description: 'Like status updated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleLike(
    @Param('slug') slug: string,
    @Req() request: any,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.toggleLike(slug, userId);
  }
}
