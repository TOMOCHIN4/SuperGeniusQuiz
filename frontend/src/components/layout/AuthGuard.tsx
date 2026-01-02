// AuthGuard - 認証が必要なルートを保護するコンポーネント

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Loading } from '@/components/ui';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 認証状態の確認中はローディング表示
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
