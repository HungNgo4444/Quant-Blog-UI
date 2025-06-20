import { Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Body, Res, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiQuery, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';
import { Response } from 'express';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Get('/admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Get all users with post count' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'active', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, type: String })
  async findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('active') active?: string,
    @Query('role') role?: string,
  ) {
    return this.usersService.findAllAdmin(page, limit, search, active, role);
  }

  @Delete('/admin/delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Put('/admin/restore/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Admin: Restore user' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async restoreUser(@Param('id') id: string) {
    return this.usersService.restoreUser(id);
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@Body() updateUserDto: any, @Request() req: any) {
    const userId = req.user.id;
    console.log(userId);
    return this.usersService.updateProfile(updateUserDto, userId);
  }
}

  