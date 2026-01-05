// Result Page
// クイズ結果画面

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, DoughnutChart } from '@/components/ui';
import type { Subject, AnswerData } from '@/types';
import styles from './Result.module.scss';

const SUBJECT_NAMES: Record<Subject, string> = {
  jp: '国語',
  math: '算数',
  sci: '理科',
  soc: '社会',
  all: '全教科',
};

export const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const score = parseInt(searchParams.get('score') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);
  const subject = (searchParams.get('subject') as Subject) || 'jp';
  const bookId = searchParams.get('book_id');

  const [answers, setAnswers] = useState<AnswerData[]>([]);

  // sessionStorageから回答データを取得
  useEffect(() => {
    const stored = sessionStorage.getItem('quizAnswers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnswerData[];
        setAnswers(parsed);
      } catch (e) {
        console.error('Failed to parse quiz answers:', e);
      }
    }
  }, []);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getMessage = () => {
    if (percentage >= 80) return 'すばらしい！';
    if (percentage >= 60) return 'よくできました！';
    if (percentage >= 40) return 'もう少し！';
    return 'がんばろう！';
  };

  // もう一度チャレンジ
  const handleRetry = () => {
    // sessionStorageをクリア
    sessionStorage.removeItem('quizAnswers');

    if (bookId) {
      // 参考書ベースの場合
      navigate(`/quiz?book_id=${encodeURIComponent(bookId)}&subject=${subject}`);
    } else {
      // 従来の教科ベース（現在は使用されていない）
      navigate(`/quiz?subject=${subject}`);
    }
  };

  // ホームに戻る
  const handleHome = () => {
    sessionStorage.removeItem('quizAnswers');
    navigate('/');
  };

  // 選択肢ラベル
  const getChoiceLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className={styles.container}>
      {/* 結果サマリー */}
      <Card className={styles.resultCard}>
        <h1 className={styles.title}>結果発表</h1>

        <div className={styles.chartArea}>
          <DoughnutChart
            value={percentage}
            label="正答率"
            color={percentage >= 60 ? '#43e97b' : '#FF6B6B'}
            size={160}
          />
        </div>

        <p className={styles.message}>{getMessage()}</p>

        <div className={styles.scoreDetail}>
          <span className={styles.subject}>{SUBJECT_NAMES[subject]}</span>
          <span className={styles.scoreText}>
            {score} / {total} 問正解
          </span>
        </div>
      </Card>

      {/* 回答詳細 */}
      {answers.length > 0 && (
        <div className={styles.answersSection}>
          <h2 className={styles.sectionTitle}>回答詳細</h2>
          {answers.map((answer, index) => {
            const isCorrect = answer.user_answer === answer.correct_index;
            const isUnanswered = answer.user_answer === -1;

            return (
              <Card
                key={answer.question_id}
                className={`${styles.answerCard} ${
                  isCorrect ? styles.correct : styles.incorrect
                }`}
              >
                {/* 問題番号とステータス */}
                <div className={styles.answerHeader}>
                  <span className={styles.questionNumber}>問{index + 1}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      isCorrect ? styles.correctBadge : styles.incorrectBadge
                    }`}
                  >
                    {isCorrect ? '○ 正解' : isUnanswered ? '× 未回答' : '× 不正解'}
                  </span>
                </div>

                {/* 問題文 */}
                <p className={styles.questionText}>{answer.question_text}</p>

                {/* ユーザーの回答 */}
                <div className={styles.userAnswer}>
                  <span className={styles.answerLabel}>あなたの回答：</span>
                  {isUnanswered ? (
                    <span className={styles.unansweredText}>回答なし（時間切れ）</span>
                  ) : (
                    <span className={isCorrect ? styles.correctText : styles.incorrectText}>
                      {getChoiceLabel(answer.user_answer)}. {answer.choices[answer.user_answer]}
                    </span>
                  )}
                </div>

                {/* 不正解の場合は正解を表示 */}
                {!isCorrect && (
                  <div className={styles.correctAnswer}>
                    <span className={styles.answerLabel}>正解：</span>
                    <span className={styles.correctText}>
                      {getChoiceLabel(answer.correct_index)}. {answer.choices[answer.correct_index]}
                    </span>
                  </div>
                )}

                {/* 解説（ヒント）- 不正解の場合のみ表示 */}
                {!isCorrect && answer.hint && (
                  <div className={styles.hintArea}>
                    <span className={styles.hintLabel}>解説：</span>
                    <p className={styles.hintText}>{answer.hint}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* アクションボタン */}
      <div className={styles.actions}>
        <Button onClick={handleRetry} fullWidth>
          もう一度チャレンジ
        </Button>
        <Button onClick={handleHome} variant="secondary" fullWidth>
          ホームに戻る
        </Button>
      </div>
    </div>
  );
};
