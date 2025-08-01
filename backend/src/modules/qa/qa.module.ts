import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../../entities/question.entity';
import { Answer } from '../../entities/answer.entity';
import { Vote } from '../../entities/vote.entity';
import { QuestionService } from './services/question.service';
import { AnswerService } from './services/answer.service';
import { QuestionController } from './controllers/question.controller';
import { AnswerController } from './controllers/answer.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, Answer, Vote]),
  ],
  controllers: [QuestionController, AnswerController],
  providers: [QuestionService, AnswerService],
  exports: [QuestionService, AnswerService],
})
export class QaModule {} 