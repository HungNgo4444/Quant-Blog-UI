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
    // Sử dụng Promise.all để thực hiện các truy vấn song song
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
}
