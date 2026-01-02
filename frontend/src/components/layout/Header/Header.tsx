import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import styles from './Header.module.scss';

export interface HeaderProps {
  /** ユーザー名（未ログイン時はundefined） */
  userName?: string;
  /** ユーザーアイコンクリック時のコールバック */
  onUserIconClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  onUserIconClick,
}) => {
  // ユーザー名のイニシャルを取得
  const getInitial = (name?: string) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className={styles.header}>
      {/* 左側スペーサー（ロゴを中央に配置するため） */}
      <div className={styles.spacer} />

      {/* 中央: ロゴ */}
      <Link to="/" className={styles.logoLink}>
        <h1 className={styles.logo}>超天才クイズ</h1>
      </Link>

      {/* 右側: ユーザーアイコン */}
      <div className={styles.userArea}>
        <button
          className={cn(styles.userButton, !userName && styles.guest)}
          onClick={onUserIconClick}
          aria-label={userName ? `${userName}のメニュー` : 'ログイン'}
        >
          {userName ? (
            <span className={styles.userInitial}>{getInitial(userName)}</span>
          ) : (
            <svg
              className={styles.userIcon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};
