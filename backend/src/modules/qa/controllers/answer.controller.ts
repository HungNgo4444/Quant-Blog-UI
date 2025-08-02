import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalAuthGuard } from '../../auth/guards/optional-auth.guard';
import { AnswerService } from '../services/answer.service';
import { CreateAnswerDto } from '../../../dto/qa/create-answer.dto';
import { VoteType } from '../../../entities/vote.entity';

@Controller('qa/answers')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post('question/:questionId')
  @UseGuards(JwtAuthGuard)
  async createAnswer(
    @Param('questionId') questionId: string,
    @Body() createAnswerDto: CreateAnswerDto,
    @Request() req,
  ) {
    const answer = await this.answerService.createAnswer(questionId, createAnswerDto, req.user.id);
    return {
      success: true,
      message: 'Tạo câu trả lời thành công',
      data: answer,
    };
  }

  @Get('question/:questionId')
  async findByQuestion(@Param('questionId') questionId: string, @Query('userId') userId?: string) {
    const answers = await this.answerService.findByQuestion(questionId, userId);
    return {
      success: true,
      data: answers,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const answer = await this.answerService.findOne(id);
    
    // Get user's vote status if authenticated
    let userVoteStatus = null;
    if (req.user?.id) {
      userVoteStatus = await this.answerService.getUserVoteStatus(id, req.user.id);
    }

    return {
      success: true,
      data: {
        ...answer,
        userVoteStatus,
      },
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateAnswer(
    @Param('id') id: string,
    @Body() updateAnswerDto: Partial<CreateAnswerDto>,
    @Request() req,
  ) {
    const answer = await this.answerService.updateAnswer(id, updateAnswerDto, req.user.id);
    return {
      success: true,
      message: 'Cập nhật câu trả lời thành công',
      data: answer,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAnswer(@Param('id') id: string, @Request() req) {
    await this.answerService.deleteAnswer(id, req.user.id);
    return {
      success: true,
      message: 'Xóa câu trả lời thành công',
    };
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async vote(
    @Param('id') id: string,
    @Body() voteDto: { voteType: VoteType },
    @Request() req,
  ) {
    const result = await this.answerService.vote(id, voteDto.voteType, req.user.id);
    return {
      success: result.success,
      message: result.message,
    };
  }

  @Get(':id/vote-status')
  @UseGuards(JwtAuthGuard)
  async getVoteStatus(@Param('id') id: string, @Request() req) {
    const voteStatus = await this.answerService.getUserVoteStatus(id, req.user.id);
    return {
      success: true,
      data: { voteStatus },
    };
  }
} 