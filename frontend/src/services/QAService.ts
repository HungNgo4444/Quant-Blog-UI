import { 
  Question, 
  Answer, 
  CreateQuestionDto, 
  CreateAnswerDto, 
  VoteType, 
  QuestionsResponse,
  QuestionResponse,
  AnswersResponse,
  VoteResponse,
  QueryQuestionsParams 
} from '../types/qa.types';
import instanceApi from '../lib/axios';

// Questions API
export async function getQuestions(params: QueryQuestionsParams = {}): Promise<QuestionsResponse> {
  try {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/qa/questions${queryString ? `?${queryString}` : ''}`;
    
    const res = await instanceApi.get(endpoint);
    return res.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

export async function getQuestion(id: string): Promise<QuestionResponse> {
  try {
    const res = await instanceApi.get(`/qa/questions/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
}

export async function createQuestion(data: CreateQuestionDto): Promise<{ data: Question }> {
  try {
    const res = await instanceApi.post('/qa/questions', data);
    return res.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

export async function updateQuestion(id: string, data: Partial<CreateQuestionDto>): Promise<{ data: Question }> {
  try {
    const res = await instanceApi.put(`/qa/questions/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

export async function deleteQuestion(id: string): Promise<void> {
  try {
    await instanceApi.delete(`/qa/questions/${id}`);
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

export async function voteQuestion(id: string, voteType: VoteType): Promise<VoteResponse> {
  try {
    const res = await instanceApi.post(`/qa/questions/${id}/vote`, { voteType });
    return res.data;
  } catch (error) {
    console.error('Error voting question:', error);
    throw error;
  }
}

// Answers API
export async function getAnswers(questionId: string): Promise<AnswersResponse> {
  try {
    const res = await instanceApi.get(`/qa/answers/question/${questionId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching answers:', error);
    throw error;
  }
}

export async function getAnswer(id: string): Promise<{ data: Answer }> {
  try {
    const res = await instanceApi.get(`/qa/answers/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching answer:', error);
    throw error;
  }
}

export async function createAnswer(questionId: string, data: CreateAnswerDto): Promise<{ data: Answer }> {
  try {
    const res = await instanceApi.post(`/qa/answers/question/${questionId}`, data);
    return res.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
}

export async function updateAnswer(id: string, data: Partial<CreateAnswerDto>): Promise<{ data: Answer }> {
  try {
    const res = await instanceApi.put(`/qa/answers/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
}

export async function deleteAnswer(id: string): Promise<void> {
  try {
    await instanceApi.delete(`/qa/answers/${id}`);
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
}

export async function voteAnswer(id: string, voteType: VoteType): Promise<VoteResponse> {
  try {
    const res = await instanceApi.post(`/qa/answers/${id}/vote`, { voteType });
    return res.data;
  } catch (error) {
    console.error('Error voting answer:', error);
    throw error;
  }
}

// Vote status API
export async function getQuestionVoteStatus(questionId: string): Promise<{ data: { voteStatus: VoteType | null } }> {
  try {
    const res = await instanceApi.get(`/qa/questions/${questionId}/vote-status`);
    return res.data;
  } catch (error) {
    console.error('Error getting question vote status:', error);
    throw error;
  }
}

export async function getAnswerVoteStatus(answerId: string): Promise<{ data: { voteStatus: VoteType | null } }> {
  try {
    const res = await instanceApi.get(`/qa/answers/${answerId}/vote-status`);
    return res.data;
  } catch (error) {
    console.error('Error getting answer vote status:', error);
    throw error;
  }
} 