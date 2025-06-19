import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';
import { PostsService } from '../posts/posts.service';
import { CreateCategoryDto } from './dto/create.dto';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectRepository(Category)
        private categoriesRepository: Repository<Category>,
        private postsService: PostsService,
    ) {}
    async findAll() {
        return await this.categoriesRepository.find();
    }

    async findAllWithPostCount() {
        //limit 7 categories
        const categories = await this.categoriesRepository.find({
            take: 7,
        });
    
        const categoriesWithPostCount = await Promise.all(
            categories.map(async category => {
                const postCount = await this.postsService.getPostCountByCategory(category.id);
                return {
                    name: category.name,
                    slug: category.slug,
                    postCount: postCount
                };
            })
        );
    
        return categoriesWithPostCount;
    }

    async findAllAdmin(page = 1, limit = 7, search?: string) {
        const queryBuilder = this.categoriesRepository
        .createQueryBuilder('category')
        .leftJoin('posts', 'post', 'CAST(post.category_id AS TEXT) = CAST(category.id AS TEXT)')
        .select([
            'category.id',
            'category.name',
            'category.description',
            'category.slug',
            'category.created_at',
            'category.updated_at',
            'COUNT(post.id) as post_count',
        ])
        .groupBy('category.id')
        .where('category.active = :active', { active: true })

        if (search) {
            queryBuilder.andWhere('category.name ILIKE :search', { search: `%${search}%` });
        }

        const total = await queryBuilder.getCount();

        const categories = await queryBuilder
        .orderBy('post_count', 'DESC')
        .offset((page - 1) * limit)
        .limit(limit)
        .getRawMany();

        return {
            categories,
            pagination: {
                currentPage: page || 1,
                totalPages: Math.ceil(total / (limit || 10)),
                totalItems: total,
                itemsPerPage: limit || 10
            }
        };
    }

    async adminCreate(createCategoryDto: CreateCategoryDto){
        const category = this.categoriesRepository.create({
            name: createCategoryDto.name,
            description: createCategoryDto.description,
            slug: createCategoryDto.slug,
        });
        return await this.categoriesRepository.save(category);
    }

    async adminUpdate(id: string, updateCategoryDto: CreateCategoryDto){
        const category = await this.categoriesRepository.findOne({ where: { id } });
        
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await this.categoriesRepository.update(id, {
            name: updateCategoryDto.name,
            description: updateCategoryDto.description,
            slug: updateCategoryDto.slug,
        });

        return await this.categoriesRepository.findOne({ where: { id } });
    }

    async adminDelete(id: string){
        const category = await this.categoriesRepository.findOne({ where: { id } });
        
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        await this.categoriesRepository.update(id, {
            active: false,
        });

        return { message: 'Category deleted successfully' };
    }
}
