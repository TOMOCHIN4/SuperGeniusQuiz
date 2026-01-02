// Login Page
// ログイン画面

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/contexts';
import styles from './Login.module.scss';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!username.trim() || !password.trim()) {
      return;
    }

    const success = await login(username.trim(), password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>超天才クイズ</h1>
        <p className={styles.subtitle}>ようこそ、未来の天才たち</p>

        <Card className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label="ユーザー名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              disabled={isLoading}
            />

            <Input
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              disabled={isLoading}
            />

            {error && <p className={styles.error}>{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!username.trim() || !password.trim()}
            >
              ログイン
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
