// Settings Page
// 設定画面

import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/contexts';
import styles from './Settings.module.scss';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>設定</h1>

      {/* ユーザー情報 */}
      <Card className={styles.card}>
        <h2 className={styles.sectionTitle}>ユーザー情報</h2>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.username?.charAt(0) || '?'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.username || 'ゲスト'}</span>
            <span className={styles.userRole}>ユーザー</span>
          </div>
        </div>
      </Card>

      {/* 学習設定 */}
      <Card className={styles.card}>
        <h2 className={styles.sectionTitle}>学習設定</h2>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>問題数</span>
          <span className={styles.settingValue}>10問</span>
        </div>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>制限時間</span>
          <span className={styles.settingValue}>30秒</span>
        </div>
      </Card>

      {/* アプリ情報 */}
      <Card className={styles.card}>
        <h2 className={styles.sectionTitle}>アプリ情報</h2>
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>バージョン</span>
          <span className={styles.settingValue}>1.0.0</span>
        </div>
      </Card>

      {/* ログアウト */}
      <div className={styles.logoutArea}>
        <Button variant="secondary" onClick={handleLogout} fullWidth>
          ログアウト
        </Button>
      </div>
    </div>
  );
};
