import { Injectable } from '@nestjs/common';
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
}
