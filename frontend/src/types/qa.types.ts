export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  answer_count?: number;
  created_at: string;
  updated_at: string;
  user: User;
  answers?: Answer[];
  userVoteStatus?: VoteType | null;
}

export interface Answer {
  id: string;
  content: string;
  upvote_count: number;
  downvote_count: number;
  created_at: string;
  updated_at: string;
  user: User;
  question_id: string;
  userVoteStatus?: VoteType | null;
}

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export enum TargetType {
  QUESTION = 'question',
  ANSWER = 'answer',
}

export interface CreateQuestionDto {
  title: string;
  content: string;
}

export interface CreateAnswerDto {
  content: string;
}

export interface VoteDto {
  target_id: string;
  target_type: TargetType;
  vote_type: VoteType;
}

export interface QAPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface QuestionsResponse {
  data: Question[];
  pagination: QAPagination;
}

export interface QuestionResponse {
  data: Question;
}

export interface AnswersResponse {
  data: Answer[];
}

export interface VoteResponse {
  success: boolean;
  message: string;
}

export interface QueryQuestionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'newest' | 'oldest' | 'most_voted' | 'most_answered';
  user_id?: string;
} 