import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ImageService } from 'src/shared/services/image.service';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly imageService: ImageService,
    ) {}

    async getById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findAllAdmin(page = 1, limit = 7, search?: string, active?: string, role?: string) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoin('posts', 'post', 'CAST(post.author_id AS TEXT) = CAST(user.id AS TEXT) AND post.active = true')
            .select([
                'user.id',
                'user.name',
                'user.email',
                'user.role',
                'user.avatar',
                'user.created_at',
                'user.updated_at',
                'COUNT(post.id) as post_count',
            ])
            .groupBy('user.id')
            .where('user.active = :active', { active: active === 'true' ? true : false });

        if (search) {
            queryBuilder.andWhere(
                '(user.name ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` }
            );
        }

        if (role !== 'all') {
            queryBuilder.andWhere('user.role = :role', { role });
        }

        const total = await queryBuilder.getCount();

        const users = await queryBuilder
            .orderBy('user.created_at', 'DESC')
            .offset((page - 1) * limit)
            .limit(limit)
            .getRawMany();

        return {
            users,
            pagination: {
                currentPage: page || 1,
                totalPages: Math.ceil(total / (limit || 10)),
                totalItems: total,
                itemsPerPage: limit || 10
            }
        };
    }

    async deleteUser(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepository.update(id, {
            active: false,
        });
        return { message: 'User deleted successfully' };
    }

    async restoreUser(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        await this.userRepository.update(id, {
            active: true,
        });
        return { message: 'User restored successfully' };
    }

    async updateProfile(updateUserDto: any, userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (updateUserDto.avatar) {
            const imageUrl = await this.imageService.uploadBase64Image(updateUserDto.avatar, 'users-avatar');
            updateUserDto.avatar = imageUrl;
        }
        await this.userRepository.update(userId, updateUserDto);
        return { message: 'User updated successfully' };
    }
}
