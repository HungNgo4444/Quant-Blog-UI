import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}
  async findAll() {
    return await this.tagsRepository.find();
  }

  async findOne(id: string) {
    return await this.tagsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    return await this.tagsRepository.update(id, updateTagDto);
  }

  async findAllAdmin(page = 1, limit = 7, search?: string) {
    const queryBuilder = this.tagsRepository
      .createQueryBuilder('tag')
      .leftJoin('post_tags', 'post_tags', 'CAST(post_tags.tag_id AS TEXT) = CAST(tag.id AS TEXT)')
      .leftJoin('posts', 'post', 'CAST(post.id AS TEXT) = CAST(post_tags.post_id AS TEXT) AND post.active = true')
      .select([
        'tag.id',
        'tag.name',
        'tag.slug',
        'tag.description',
        'tag.created_at',
        'tag.updated_at',
        'COUNT(post.id) as post_count',
      ])
      .groupBy('tag.id')
      .where('tag.active = :active', { active: true });

    if (search) {
      queryBuilder.andWhere('tag.name ILIKE :search', { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();

    const tags = await queryBuilder
      .orderBy('post_count', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany();

    return {
      tags,
      pagination: {
        currentPage: page || 1,
        totalPages: Math.ceil(total / (limit || 10)),
        totalItems: total,
        itemsPerPage: limit || 10
      }
    };
  }

  async adminCreate(createTagDto: CreateTagDto){
    const tag = this.tagsRepository.create({
      name: createTagDto.name,
      slug: createTagDto.slug,
      description: createTagDto.description,
    });
    return await this.tagsRepository.save(tag);
  }

  async adminUpdate(id: string, updateTagDto: CreateTagDto){
    const tag = await this.tagsRepository.findOne({ where: { id } });
    
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.tagsRepository.update(id, {
      name: updateTagDto.name,
      slug: updateTagDto.slug,
      description: updateTagDto.description,
    });

    return await this.tagsRepository.findOne({ where: { id } });
  }

  async adminDelete(id: string){
    const tag = await this.tagsRepository.findOne({ where: { id } });
    
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.tagsRepository.update(id, {
      active: false,
    });

    return { message: 'Tag deleted successfully' };
  }
}
