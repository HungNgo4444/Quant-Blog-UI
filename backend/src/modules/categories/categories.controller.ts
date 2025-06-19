import { Body, Controller, Delete, Get, Post, Put, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}
  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('/all-with-post-count')
  async findAllWithPostCount() {
    return this.categoriesService.findAllWithPostCount();
  }

  @Get('/admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Get all categories with post count' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.findAllAdmin(page, limit, search);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async adminCreate(@Body() createCategoryDto: CreateCategoryDto){
    return this.categoriesService.adminCreate(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async adminUpdate(@Param('id') id: string, @Body() updateCategoryDto: CreateCategoryDto){
    return this.categoriesService.adminUpdate(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Soft delete a category (set active to false)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async adminDelete(@Param('id') id: string){
    return this.categoriesService.adminDelete(id);
  }

}
