// AuthContext - 認証状態管理

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { login as apiLogin } from '@/services/api';

// ========================================
// コンテキスト型定義
// ========================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ========================================
// ローカルストレージキー
// ========================================

const STORAGE_KEY = 'supergenius_user';

// ========================================
// AuthProvider コンポーネント
// ========================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化: ローカルストレージからユーザー情報を復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored) as User;
        setUser(userData);
      }
    } catch (e) {
      console.error('Failed to restore user from storage:', e);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ログイン処理
  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiLogin(username, password);

        if (response.success && response.user) {
          setUser(response.user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
          return true;
        } else {
          setError(response.error || 'ログインに失敗しました');
          return false;
        }
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'ネットワークエラーが発生しました';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ログアウト処理
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // エラークリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ========================================
// useAuth フック
// ========================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
