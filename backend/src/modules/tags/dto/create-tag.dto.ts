import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Tag slug' })
  @IsNotEmpty()
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Tag description', required: false })
  @IsNotEmpty()
  @IsString()
  description?: string;
}
