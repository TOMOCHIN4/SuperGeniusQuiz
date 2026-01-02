// API Service - GAS APIとの通信基盤

import type {
  LoginResponse,
  GetQuestionsResponse,
  GetGenresResponse,
  SubmitAnswersResponse,
  GetStatsResponse,
  GetRecentImportsResponse,
  GetHistoryResponse,
  Subject,
  AnswerData,
} from '@/types';

// GAS API エンドポイント
const API_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbwzRzBLo0D32sn5lI9vgvDsc7vmJW4VZ9_m1kM_he5iGPWF-CJ6steCcCGOFoTnxK3D/exec';

// API通信の基本関数
async function callApi<T>(params: Record<string, unknown>): Promise<T> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain', // GASはtext/plainを期待
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ========================================
// 認証 API
// ========================================

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  return callApi<LoginResponse>({
    action: 'login',
    username,
    password,
  });
}

// ========================================
// 問題取得 API
// ========================================

export async function getQuestions(
  subject: Subject,
  options?: {
    genre_id?: string;
    batch_id?: string;
    count?: number;
  }
): Promise<GetQuestionsResponse> {
  return callApi<GetQuestionsResponse>({
    action: 'get_questions',
    subject,
    ...options,
  });
}

// ========================================
// ジャンル取得 API
// ========================================

export async function getGenres(subject: Subject): Promise<GetGenresResponse> {
  return callApi<GetGenresResponse>({
    action: 'get_genres',
    subject,
  });
}

// ========================================
// 回答送信 API
// ========================================

export async function submitAnswers(
  userId: string,
  sessionId: string,
  subject: Subject,
  answers: AnswerData[],
  timeRemaining: number
): Promise<SubmitAnswersResponse> {
  return callApi<SubmitAnswersResponse>({
    action: 'submit_answers',
    user_id: userId,
    session_id: sessionId,
    subject,
    answers,
    time_remaining: timeRemaining,
  });
}

// ========================================
// 統計取得 API
// ========================================

export async function getStats(userId: string): Promise<GetStatsResponse> {
  return callApi<GetStatsResponse>({
    action: 'get_stats',
    user_id: userId,
  });
}

// ========================================
// 最近のインポート取得 API
// ========================================

export async function getRecentImports(
  limit: number = 5
): Promise<GetRecentImportsResponse> {
  return callApi<GetRecentImportsResponse>({
    action: 'get_recent_imports',
    limit,
  });
}

// ========================================
// 履歴取得 API
// ========================================

export async function getHistory(
  userId: string,
  limit: number = 20
): Promise<GetHistoryResponse> {
  return callApi<GetHistoryResponse>({
    action: 'get_history',
    user_id: userId,
    limit,
  });
}

// デフォルトエクスポート
export const api = {
  login,
  getQuestions,
  getGenres,
  submitAnswers,
  getStats,
  getRecentImports,
  getHistory,
};

export default api;
