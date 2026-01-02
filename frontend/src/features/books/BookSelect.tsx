// BookSelect Page
// 参考書選択画面

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Loading } from '@/components/ui';
import { getBooks } from '@/services/api';
import type { Book, Subject } from '@/types';
import styles from './BookSelect.module.scss';

// 教科名マッピング
const SUBJECT_NAMES: Record<Subject, string> = {
  jp: '国語',
  math: '算数',
  sci: '理科',
  soc: '社会',
  all: '全教科',
};

// 教科カラー
const SUBJECT_COLORS: Record<Subject, string> = {
  jp: '#4A90E2',
  math: '#50C878',
  sci: '#00A896',
  soc: '#FF6B6B',
  all: '#9B59B6',
};

export const BookSelect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const subject = (searchParams.get('subject') as Subject) || 'all';

  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getBooks(subject !== 'all' ? subject : undefined);
        if (response.success) {
          // 指定教科のみフィルタ（allの場合は全て）
          const filtered = subject === 'all'
            ? response.books
            : response.books.filter((b) => b.subject === subject);
          setBooks(filtered);
        } else {
          setError(response.error || '参考書の取得に失敗しました');
        }
      } catch (err) {
        console.error('Failed to fetch books:', err);
        setError('参考書の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [subject]);

  const handleBookClick = (bookId: string) => {
    navigate(`/quiz?book_id=${encodeURIComponent(bookId)}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Loading />
        <p className={styles.loadingText}>参考書を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <Button variant="ghost" size="sm" onClick={handleBack}>
          ← 戻る
        </Button>
        <h1 className={styles.title}>
          <span
            className={styles.subjectBadge}
            style={{ backgroundColor: SUBJECT_COLORS[subject] }}
          >
            {SUBJECT_NAMES[subject]}
          </span>
          の参考書
        </h1>
      </div>

      {/* エラー表示 */}
      {error && (
        <Card className={styles.errorCard}>
          <p className={styles.errorText}>{error}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            ホームに戻る
          </Button>
        </Card>
      )}

      {/* 参考書がない場合 */}
      {!error && books.length === 0 && (
        <Card className={styles.emptyCard}>
          <p className={styles.emptyText}>
            この教科の参考書はまだ登録されていません
          </p>
          <Button onClick={() => navigate('/')} variant="secondary">
            ホームに戻る
          </Button>
        </Card>
      )}

      {/* 参考書一覧 */}
      {books.length > 0 && (
        <div className={styles.bookGrid}>
          {books.map((book) => (
            <Card
              key={book.book_id}
              className={styles.bookCard}
              interactive
              onClick={() => handleBookClick(book.book_id)}
              accentColor={SUBJECT_COLORS[book.subject]}
            >
              <div className={styles.bookContent}>
                <h3 className={styles.bookTitle}>{book.title}</h3>
                <div className={styles.bookMeta}>
                  <span className={styles.questionCount}>
                    {book.question_count}問
                  </span>
                </div>
              </div>
              <div className={styles.bookArrow}>→</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
