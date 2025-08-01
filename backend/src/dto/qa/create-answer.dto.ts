import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Câu trả lời phải có ít nhất 10 ký tự' })
  content: string;
} 