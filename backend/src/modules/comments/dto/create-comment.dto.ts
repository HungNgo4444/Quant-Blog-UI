import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ 
    description: 'Nội dung comment',
    example: 'Bài viết rất hay! Cảm ơn tác giả đã chia sẻ.'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000, { message: 'Nội dung comment không được quá 1000 ký tự' })
  content: string;

  @ApiProperty({ 
    description: 'ID của bài viết',
    example: 'uuid-of-post'
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @ApiPropertyOptional({ 
    description: 'ID của comment cha (cho reply)',
    example: 'uuid-of-parent-comment'
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ 
    description: 'URL ảnh đính kèm (nếu có)',
    example: 'https://example.com/image.jpg'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  replyCount: number;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  author: {
    id: string;
    name: string;
    avatar?: string;
  };

  @ApiPropertyOptional()
  children?: CommentResponseDto[];
}
