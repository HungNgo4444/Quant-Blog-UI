import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Question } from '../../../entities/question.entity';
import { Answer } from '../../../entities/answer.entity';
import { Vote, VoteType, TargetType } from '../../../entities/vote.entity';
import { CreateQuestionDto } from '../../../dto/qa/create-question.dto';
import { QueryQuestionsDto } from '../../../dto/qa/query-questions.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Answer)
    private answerRepository: Repository<Answer>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
  ) {}

  async createQuestion(createQuestionDto: CreateQuestionDto, userId: string): Promise<Question> {
    const question = this.questionRepository.create({
      ...createQuestionDto,
      userId: userId,
    });

    return await this.questionRepository.save(question);
  }

  async findAll(queryDto: QueryQuestionsDto) {
    const { pageNumber, limitNumber, offset, search, sort, userId } = queryDto;

    let queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user');

    // Search functionality
    if (search) {
      queryBuilder = queryBuilder.where(
        '(question.title ILIKE :search OR question.content ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Filter by user
    if (userId) {
      queryBuilder = queryBuilder.andWhere('question.userId = :userId', { userId });
    }

    // Sorting
    switch (sort) {
      case 'oldest':
        queryBuilder = queryBuilder.orderBy('question.created_at', 'ASC');
        break;
      case 'most_voted':
        queryBuilder = queryBuilder.orderBy('(question.upvote_count - question.downvote_count)', 'DESC');
        break;
      case 'most_answered':
        queryBuilder = queryBuilder
          .orderBy('question.answer_count', 'DESC');
        break;
      case 'newest':
      default:
        queryBuilder = queryBuilder.orderBy('question.created_at', 'DESC');
        break;
    }

    const [questions, total] = await queryBuilder
      .skip(offset)
      .take(limitNumber)
      .getManyAndCount();

    return {
      data: questions,
      pagination: {
        current_page: pageNumber,
        per_page: limitNumber,
        total,
        total_pages: Math.ceil(total / limitNumber),
      },
    };
  }

  async findOne(id: string, userId?: string): Promise<Question> {
    const queryBuilder = this.questionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.user', 'user')
      .leftJoinAndSelect('question.answers', 'answers')
      .leftJoinAndSelect('answers.user', 'answerUser')
      .where('question.id = :id', { id });

    // Load vote information if needed
    // Note: We'll get vote status separately to avoid complex joins

    const question = await queryBuilder.getOne();

    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    // Sort answers by votes
    if (question.answers) {
      question.answers.sort((a, b) => (b.upvote_count - b.downvote_count) - (a.upvote_count - a.downvote_count));
    }

    return question;
  }

  async updateQuestion(id: string, updateData: Partial<CreateQuestionDto>, userId: string): Promise<Question> {
    const question = await this.findOne(id);
    
    if (question.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa câu hỏi này');
    }

    Object.assign(question, updateData);
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(id: string, userId: string): Promise<void> {
    const question = await this.findOne(id);
    
    if (question.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa câu hỏi này');
    }

    await this.questionRepository.remove(question);
  }

  async vote(questionId: string, voteType: VoteType, userId: string): Promise<{ success: boolean; message: string }> {
    const question = await this.questionRepository.findOne({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: {
        user_id: userId,
        target_id: questionId,
        target_type: TargetType.QUESTION,
      },
    });

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        await this.voteRepository.remove(existingVote);
        
        if (voteType === VoteType.UPVOTE) {
          question.upvote_count = Math.max(0, question.upvote_count - 1);
        } else {
          question.downvote_count = Math.max(0, question.downvote_count - 1);
        }
        
        await this.questionRepository.save(question);
        return { success: true, message: 'Đã hủy vote' };
      } else {
        // Change vote type
        existingVote.vote_type = voteType;
        await this.voteRepository.save(existingVote);
        
        if (voteType === VoteType.UPVOTE) {
          question.upvote_count += 1;
          question.downvote_count = Math.max(0, question.downvote_count - 1);
        } else {
          question.downvote_count += 1;
          question.upvote_count = Math.max(0, question.upvote_count - 1);
        }
        
        await this.questionRepository.save(question);
        return { success: true, message: 'Đã thay đổi vote' };
      }
    } else {
      // Create new vote
      const newVote = this.voteRepository.create({
        user_id: userId,
        target_id: questionId,
        target_type: TargetType.QUESTION,
        vote_type: voteType,
      });
      
      await this.voteRepository.save(newVote);
      
      if (voteType === VoteType.UPVOTE) {
        question.upvote_count += 1;
      } else {
        question.downvote_count += 1;
      }
      
      await this.questionRepository.save(question);
      return { success: true, message: 'Đã vote thành công' };
    }
  }

  async getUserVoteStatus(questionId: string, userId: string): Promise<VoteType | null> {
    const vote = await this.voteRepository.findOne({
      where: {
        user_id: userId,
        target_id: questionId,
        target_type: TargetType.QUESTION,
      },
    });

    return vote ? vote.vote_type : null;
  }
} 