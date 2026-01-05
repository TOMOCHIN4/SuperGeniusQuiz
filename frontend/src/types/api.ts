// API Types - GAS API とのインターフェース定義

// ========================================
// 共通
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

// ========================================
// ユーザー・認証
// ========================================

export interface User {
  user_id: string;
  username: string;
}

export interface LoginRequest {
  action: 'login';
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// ========================================
// 問題
// ========================================

export type Subject = 'jp' | 'math' | 'sci' | 'soc' | 'all';

export interface Question {
  question_id: string;
  subject: Subject;
  genre_id: string;
  genre_name: string;
  question_text: string;
  choices: string[];
  correct_index: number;
  hint?: string;
}

export interface GetQuestionsRequest {
  action: 'get_questions';
  subject: Subject;
  genre_id?: string;
  batch_id?: string;
  count?: number;
}

export interface GetQuestionsResponse {
  success: boolean;
  questions: Question[];
  time_limit: number;
  error?: string;
}

// ========================================
// ジャンル
// ========================================

export interface Genre {
  genre_id: string;
  genre_name: string;
  count: number;
}

export interface GetGenresRequest {
  action: 'get_genres';
  subject: Subject;
}

export interface GetGenresResponse {
  success: boolean;
  genres: Genre[];
  error?: string;
}

// ========================================
// 回答
// ========================================

export interface AnswerData {
  question_id: string;
  genre_id: string;
  user_answer: number;
  correct_index: number;
  question_text: string;
  choices: string[];
  hint?: string;
  time_taken?: number;
}

export interface SubmitAnswersRequest {
  action: 'submit_answers';
  user_id: string;
  session_id: string;
  subject: Subject;
  answers: AnswerData[];
  time_remaining: number;
}

export interface SubmitAnswersResponse {
  success: boolean;
  correct_count: number;
  total: number;
  accuracy: number;
  error?: string;
}

// ========================================
// 統計
// ========================================

export interface SubjectStats {
  total: number;
  correct: number;
}

export interface UserStats {
  total_questions: number;
  total_correct: number;
  overall_accuracy: number;
  by_subject: Record<Subject, SubjectStats>;
}

export interface GetStatsRequest {
  action: 'get_stats';
  user_id: string;
}

export interface GetStatsResponse {
  success: boolean;
  stats: UserStats;
  error?: string;
}

// ========================================
// 最近のインポート
// ========================================

export interface ImportBatch {
  batch_id: string;
  count: number;
  subjects: Array<{ subject: Subject; count: number }>;
  created_at: string;
}

export interface GetRecentImportsRequest {
  action: 'get_recent_imports';
  limit?: number;
}

export interface GetRecentImportsResponse {
  success: boolean;
  imports: ImportBatch[];
  error?: string;
}

// ========================================
// 履歴
// ========================================

export interface HistoryItem {
  session_id: string;
  subject: Subject;
  genre_id: string;
  total_questions: number;
  correct_count: number;
  time_limit: number;
  time_remaining: number;
  started_at: string;
  finished_at: string;
}

export interface GetHistoryRequest {
  action: 'get_history';
  user_id: string;
  limit?: number;
}

export interface GetHistoryResponse {
  success: boolean;
  history: HistoryItem[];
  error?: string;
}

// ========================================
// API リクエスト全般
// ========================================

// ========================================
// 参考書（Book）
// ========================================

export interface Book {
  book_id: string;
  subject: Subject;
  title: string;
  question_count: number;
  answered_count?: number;
  correct_count?: number;
  accuracy?: number;
}

export interface GetBooksRequest {
  action: 'get_books';
  subject?: Subject;
  user_id?: string;
}

export interface GetBooksResponse {
  success: boolean;
  books: Book[];
  total: number;
  error?: string;
}

export interface BookQuestion {
  question_id: string;
  question_text: string;
  choices: string[];
  correct_index: number;
  hint?: string;
  book_id: string;
  subject: Subject;
}

export interface GetBookQuestionsRequest {
  action: 'get_book_questions';
  book_id: string;
  count?: number;
}

export interface GetBookQuestionsResponse {
  success: boolean;
  questions: BookQuestion[];
  time_limit: number;
  book_id: string;
  error?: string;
}

// ========================================
// API リクエスト全般
// ========================================

export type ApiRequest =
  | LoginRequest
  | GetQuestionsRequest
  | GetGenresRequest
  | SubmitAnswersRequest
  | GetStatsRequest
  | GetRecentImportsRequest
  | GetHistoryRequest
  | GetBooksRequest
  | GetBookQuestionsRequest;
