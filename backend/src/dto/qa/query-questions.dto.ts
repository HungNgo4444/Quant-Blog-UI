import { IsOptional, IsString, IsIn, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryQuestionsDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page phải là số' })
  page?: string = '1';

  @IsOptional()
  @IsNumberString({}, { message: 'Limit phải là số' })
  limit?: string = '10';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['newest', 'oldest', 'most_voted', 'most_answered'], {
    message: 'Sort order không hợp lệ'
  })
  sort?: 'newest' | 'oldest' | 'most_voted' | 'most_answered' = 'newest';

  @IsOptional()
  @IsString()
  userId?: string;

  @Transform(({ value }) => parseInt(value, 10))
  get pageNumber(): number {
    return parseInt(this.page, 10);
  }

  @Transform(({ value }) => parseInt(value, 10))
  get limitNumber(): number {
    return Math.min(parseInt(this.limit, 10), 50); // Max 50 items per page
  }

  get offset(): number {
    return (this.pageNumber - 1) * this.limitNumber;
  }
} 