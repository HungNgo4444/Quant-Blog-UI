import { Controller, Get, Post, Put, Delete, Param, Query, Req, UseGuards, Body } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PaginatedPostsResponseDto, PostResponseDto, CreatePostDto, UpdatePostDto } from './dto/post.dto';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { request, Request } from 'express';

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
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
    @Query('sort') sort?: string,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.findAll(page, limit, category, tag, search, sort, userId);
  }

  @Get('/featured')
  @ApiOperation({ summary: 'Get featured posts' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async getFeaturedPost(
    @Query('limit') limit?: number,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.getFeaturedPost(limit);
  }

  @Get('/recent')
  @ApiOperation({ summary: 'Get recent posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async getRecentPost(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.getRecentPost(page, limit);
  }

  @Get('/top')
  @ApiOperation({ summary: 'Get top posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async getTopPost(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sort') sort?: string,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.getTopPost(page, limit, sort);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, type: PostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Req() request: any,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostResponseDto> {
    const userId = request.user.id;
    
    return this.postsService.create(createPostDto, userId);
  }

  @Get('/getByUser')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get posts by user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: 200, type: [PostResponseDto] })
  async getPostByUser(
    @Req() request: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getPostByUser(userId, page, limit, category, tag, search, sort, status);
  }

  @Get('/user/:id')
  @ApiOperation({ summary: 'Get published posts by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async getPostsByUserId(
    @Param('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedPostsResponseDto> {
    return this.postsService.getPublishedPostsByUserId(userId, page, limit);
  }

  @Get('/my-stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user posts statistics' })
  @ApiResponse({ status: 200, description: 'User posts statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPostsStats(
    @Req() request: any,
  ): Promise<{ totalPosts: number; totalViews: number }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getUserPostsStats(userId);
  }

  @Get('/saved')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get saved posts by user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'tag', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiResponse({ status: 200, type: PaginatedPostsResponseDto })
  async getSavedPosts(
    @Req() request: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ): Promise<PaginatedPostsResponseDto> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getSavedPostsByUser(userId, page, limit, category, tag, search, sort);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by slug' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postsService.findOneBySlug(slug);
  }

  @Get(':slug/include-draft')
  @ApiOperation({ summary: 'Get a post by slug' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOneIncludingDrafts(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postsService.findOneBySlugIncludingDrafts(slug);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, type: PostResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Author or Admin only' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('slug') slug: string,
    @Req() request: any,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostResponseDto> {
    const userId = request.user.id;
    const userRole = request.user.role;
    
    return this.postsService.update(slug, updatePostDto, userId, userRole);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Author or Admin only' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async delete(
    @Param('slug') slug: string,
    @Req() request: any,
  ): Promise<{ message: string }> {
    const userId = request.user.id;
    const userRole = request.user.role;
    
    return this.postsService.delete(slug, userId, userRole);
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

  @Post('bulk/save-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get save status for multiple posts' })
  @ApiResponse({ status: 200, description: 'Save status retrieved for multiple posts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getBulkSaveStatus(
    @Req() request: any,
    @Body() body: { slugs: string[] },
  ): Promise<{ [slug: string]: boolean }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getBulkSaveStatus(body.slugs, userId);
  }

  @Get(':slug/save-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check if current user has saved the post' })
  @ApiResponse({ status: 200, description: 'Save status retrieved' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSaveStatus(
    @Param('slug') slug: string,
    @Req() request: any,
  ): Promise<{ saved: boolean }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.getSaveStatus(slug, userId);
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

  @Post(':slug/save')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Save or unsave a post' })
  @ApiResponse({ status: 200, description: 'Save status updated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async toggleSave(
    @Param('slug') slug: string,
    @Req() request: any,
  ): Promise<{ saved: boolean; message: string }> {
    const userId = request.user.id; // From JWT payload
    return this.postsService.toggleSavePost(slug, userId);
  }

  @Get('/admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Get all posts with basic filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAdminPosts(
    @Req() request: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<any> {
    // Check if user is admin (you might want to add admin role check here)
    // For now, any authenticated user can access
    return this.postsService.getAdminPosts(page, limit, status, search);
  }
}
