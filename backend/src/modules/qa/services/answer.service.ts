import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from '../../../entities/answer.entity';
import { Question } from '../../../entities/question.entity';
import { Vote, VoteType, TargetType } from '../../../entities/vote.entity';
import { CreateAnswerDto } from '../../../dto/qa/create-answer.dto';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async createAnswer(questionId: string, createAnswerDto: CreateAnswerDto, userId: string): Promise<Answer> {
    // Check if question exists
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    const answer = this.answerRepository.create({
      ...createAnswerDto,
      question_id: questionId,
      user_id: userId,
    });

    const savedAnswer = await this.answerRepository.save(answer);
    
    // Update answer count
    await this.questionRepository.increment({ id: questionId }, 'answer_count', 1);

    return savedAnswer;
  }

  async findByQuestion(questionId: string, userId?: string): Promise<Answer[]> {
    const queryBuilder = this.answerRepository
      .createQueryBuilder('answer')
      .leftJoinAndSelect('answer.user', 'user')
      .where('answer.question_id = :questionId', { questionId });

    // If user is authenticated, get their vote status for each answer
    if (userId) {
      queryBuilder.leftJoinAndSelect(
        'answer.votes',
        'userVote',
        'userVote.user_id = :userId AND userVote.target_id = answer.id AND userVote.target_type = :targetType',
        { userId, targetType: TargetType.ANSWER }
      );
    }

    const answers = await queryBuilder.getMany();

    // Sort by votes (highest first)
    return answers.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
  }

  async findOne(id: string): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id },
      relations: ['user', 'question'],
    });

    if (!answer) {
      throw new NotFoundException('Câu trả lời không tồn tại');
    }

    return answer;
  }

  async updateAnswer(id: string, updateData: Partial<CreateAnswerDto>, userId: string): Promise<Answer> {
    const answer = await this.findOne(id);
    
    if (answer.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa câu trả lời này');
    }

    Object.assign(answer, updateData);
    return await this.answerRepository.save(answer);
  }

  async deleteAnswer(id: string, userId: string): Promise<void> {
    const answer = await this.findOne(id);
    
    if (answer.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa câu trả lời này');
    }

    const questionId = answer.question_id;
    await this.answerRepository.remove(answer);
    
    // Update answer count
    await this.questionRepository.decrement({ id: questionId }, 'answer_count', 1);
  }

  async vote(answerId: string, voteType: VoteType, userId: string): Promise<{ success: boolean; message: string }> {
    const answer = await this.answerRepository.findOne({ where: { id: answerId } });
    if (!answer) {
      throw new NotFoundException('Câu trả lời không tồn tại');
    }

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: {
        user_id: userId,
        target_id: answerId,
        target_type: TargetType.ANSWER,
      },
    });

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        await this.voteRepository.remove(existingVote);
        
        if (voteType === VoteType.UPVOTE) {
          answer.upvote_count = Math.max(0, answer.upvote_count - 1);
        } else {
          answer.downvote_count = Math.max(0, answer.downvote_count - 1);
        }
        
        await this.answerRepository.save(answer);
        return { success: true, message: 'Đã hủy vote' };
      } else {
        // Change vote type
        existingVote.vote_type = voteType;
        await this.voteRepository.save(existingVote);
        
        if (voteType === VoteType.UPVOTE) {
          answer.upvote_count += 1;
          answer.downvote_count = Math.max(0, answer.downvote_count - 1);
        } else {
          answer.downvote_count += 1;
          answer.upvote_count = Math.max(0, answer.upvote_count - 1);
        }
        
        await this.answerRepository.save(answer);
        return { success: true, message: 'Đã thay đổi vote' };
      }
    } else {
      // Create new vote
      const newVote = this.voteRepository.create({
        user_id: userId,
        target_id: answerId,
        target_type: TargetType.ANSWER,
        vote_type: voteType,
      });
      
      await this.voteRepository.save(newVote);
      
      if (voteType === VoteType.UPVOTE) {
        answer.upvote_count += 1;
      } else {
        answer.downvote_count += 1;
      }
      
      await this.answerRepository.save(answer);
      return { success: true, message: 'Đã vote thành công' };
    }
  }

  async getUserVoteStatus(answerId: string, userId: string): Promise<VoteType | null> {
    const vote = await this.voteRepository.findOne({
      where: {
        user_id: userId,
        target_id: answerId,
        target_type: TargetType.ANSWER,
      },
    });

    return vote ? vote.vote_type : null;
  }
} 