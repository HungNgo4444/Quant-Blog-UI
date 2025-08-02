import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Câu trả lời phải có ít nhất 2 ký tự' })
  content: string;
} 