import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Tiêu đề phải có ít nhất 10 ký tự' })
  @MaxLength(255, { message: 'Tiêu đề không được vượt quá 255 ký tự' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Nội dung phải có ít nhất 20 ký tự' })
  content: string;
} 