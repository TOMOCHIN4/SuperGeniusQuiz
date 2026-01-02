import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import styles from './Layout.module.scss';

interface LayoutProps {
  /** ユーザー名（未ログイン時はundefined） */
  userName?: string;
  /** ユーザーアイコンクリック時のコールバック */
  onUserIconClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  userName,
  onUserIconClick,
}) => {
  return (
    <div className={styles.container}>
      <Header userName={userName} onUserIconClick={onUserIconClick} />

      <main className={styles.main}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
