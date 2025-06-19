import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { User, UserRole } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { DashboardStats } from '../../common/types';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getStats(): Promise<DashboardStats> {
    const [
      postsCount,
      totalViews,
      usersCount,
      authorsCount,
      categoriesCount,
    ] = await Promise.all([
      this.postRepository.count(),
      this.postRepository
        .createQueryBuilder('post')
        .select('SUM(post.viewCount)', 'total')
        .getRawOne(),
      this.userRepository.count(),
      this.userRepository.count({ where: { role: UserRole.ADMIN } }),
      this.categoryRepository.count(),
    ]);

    return {
      posts: {
        total: postsCount,
        views: parseInt(totalViews?.total || '0'),
      },
      users: {
        total: usersCount,
        authors: authorsCount,
      },
      categories: {
        total: categoriesCount,
      },
    };
  }

  async getOverview(): Promise<any> {
    const currentYear = new Date().getFullYear();
    
    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      name: `T${index + 1}`,
      month: index + 1,
      total: 0,
    }));

    const results = await this.postRepository
      .createQueryBuilder('post')
      .select('EXTRACT(MONTH FROM post.createdAt)', 'month')
      .addSelect('COUNT(*)', 'total')
      .where('EXTRACT(YEAR FROM post.createdAt) = :year', { year: currentYear })
      .groupBy('EXTRACT(MONTH FROM post.createdAt)')
      .orderBy('EXTRACT(MONTH FROM post.createdAt)', 'ASC')
      .getRawMany();
      
    results.forEach((result) => {
      const monthIndex = parseInt(result.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].total = parseInt(result.total);
      }
    });

    return monthlyData;
  }
}
