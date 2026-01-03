// Quiz Page
// クイズ画面

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, ProgressBar, Loading } from '@/components/ui';
import { useAuth } from '@/contexts';
import { getQuestions, getBookQuestions, submitAnswers } from '@/services/api';
import type { Question, Subject, AnswerData, BookQuestion } from '@/types';
import styles from './Quiz.module.scss';

// 教科名マッピング
const SUBJECT_NAMES: Record<Subject, string> = {
  jp: '国語',
  math: '算数',
  sci: '理科',
  soc: '社会',
  all: '全教科',
};

// 統一された問題型（QuestionとBookQuestionを統合）
type UnifiedQuestion = (Question | BookQuestion) & {
  genre_id?: string;
  genre_name?: string;
  book_id?: string;
};

export const Quiz: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // パラメータ取得
  const bookId = searchParams.get('book_id');
  const subject = (searchParams.get('subject') as Subject) || 'all';

  // 参考書名を抽出（book_idから）
  const bookTitle = bookId ? bookId.replace(/^(jp|math|sci|soc)_/, '') : null;

  // 問題データ
  const [questions, setQuestions] = useState<UnifiedQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // クイズ進行状態
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 回答データを収集
  const answersRef = useRef<AnswerData[]>([]);
  const sessionIdRef = useRef<string>(Date.now().toString());
  const timeLimitRef = useRef<number>(180);

  // 問題を取得
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      setLoadError(null);

      try {
        // book_idがある場合は参考書から問題取得
        if (bookId) {
          const response = await getBookQuestions(bookId, 10);
          if (response.success && response.questions.length > 0) {
            setQuestions(response.questions);
            setTimeLeft(response.time_limit);
            timeLimitRef.current = response.time_limit;
          } else {
            setLoadError(response.error || '問題が見つかりませんでした');
          }
        } else {
          // 従来の教科別問題取得
          const response = await getQuestions(subject, { count: 10 });
          if (response.success && response.questions.length > 0) {
            setQuestions(response.questions);
            setTimeLeft(response.time_limit);
            timeLimitRef.current = response.time_limit;
          } else {
            setLoadError('問題が見つかりませんでした');
          }
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setLoadError('問題の取得に失敗しました');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [subject, bookId]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;

  // タイマー
  useEffect(() => {
    if (isLoadingQuestions || questions.length === 0) return;
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 時間切れ - 全体のタイマー終了
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoadingQuestions, questions.length, isAnswered, currentIndex]);

  // 回答処理
  const handleAnswer = useCallback(
    (choiceIndex: number) => {
      if (isAnswered || !currentQuestion) return;

      setSelectedChoice(choiceIndex);
      setIsAnswered(true);

      const isCorrect = choiceIndex === currentQuestion.correct_index;
      if (isCorrect) {
        setScore((prev) => prev + 1);
      }

      // 回答データを記録
      answersRef.current.push({
        question_id: currentQuestion.question_id,
        genre_id: currentQuestion.genre_id || currentQuestion.book_id || 'unknown',
        user_answer: choiceIndex,
        correct_index: currentQuestion.correct_index,
        question_text: currentQuestion.question_text,
        choices: currentQuestion.choices,
      });
    },
    [isAnswered, currentQuestion]
  );

  // クイズ終了処理
  const finishQuiz = async () => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    // 時間切れ時: 未回答の問題を不正解として記録
    const startIdx = isAnswered ? currentIndex + 1 : currentIndex;
    for (let i = startIdx; i < questions.length; i++) {
      const q = questions[i];
      answersRef.current.push({
        question_id: q.question_id,
        genre_id: q.genre_id || q.book_id || 'unknown',
        user_answer: -1, // 未回答
        correct_index: q.correct_index,
        question_text: q.question_text,
        choices: q.choices,
      });
    }

    try {
      const response = await submitAnswers(
        user.user_id,
        sessionIdRef.current,
        subject,
        answersRef.current,
        timeLeft
      );

      if (response.success) {
        navigate(
          `/result?score=${response.correct_count}&total=${response.total}&subject=${subject}`
        );
      } else {
        console.error('Failed to submit answers:', response.error);
        // エラーでも結果画面へ
        navigate(
          `/result?score=${score}&total=${questions.length}&subject=${subject}`
        );
      }
    } catch (error) {
      console.error('Failed to submit answers:', error);
      navigate(
        `/result?score=${score}&total=${questions.length}&subject=${subject}`
      );
    }
  };

  // 次の問題へ
  const handleNext = () => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedChoice(null);
      setIsAnswered(false);
    }
  };

  // 選択肢のスタイル
  const getChoiceStyle = (index: number) => {
    if (!isAnswered || !currentQuestion) return '';
    if (index === currentQuestion.correct_index) return styles.correct;
    if (index === selectedChoice) return styles.incorrect;
    return '';
  };

  // タイマー表示のフォーマット
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // ローディング中
  if (isLoadingQuestions) {
    return (
      <div className={styles.container}>
        <Loading />
        <p className={styles.loadingText}>問題を読み込み中...</p>
      </div>
    );
  }

  // エラー
  if (loadError || !currentQuestion) {
    return (
      <div className={styles.container}>
        <Card className={styles.errorCard}>
          <p className={styles.errorText}>{loadError || '問題がありません'}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            ホームに戻る
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ヘッダー情報 */}
      <div className={styles.header}>
        <span className={styles.subject}>
          {bookTitle ? bookTitle : SUBJECT_NAMES[subject]}
        </span>
        <span className={styles.progress}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* プログレスバー */}
      <ProgressBar value={progress} size="sm" />

      {/* タイマー */}
      <div className={styles.timer}>
        <span className={timeLeft <= 30 ? styles.timerWarning : ''}>
          残り {formatTime(timeLeft)}
        </span>
      </div>

      {/* 問題カード */}
      <Card className={styles.questionCard}>
        <p className={styles.questionText}>{currentQuestion.question_text}</p>
      </Card>

      {/* 選択肢 */}
      <div className={styles.choices}>
        {currentQuestion.choices.map((choice, index) => (
          <button
            key={index}
            className={`${styles.choiceButton} ${getChoiceStyle(index)}`}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
          >
            <span className={styles.choiceLabel}>
              {String.fromCharCode(65 + index)}
            </span>
            <span className={styles.choiceText}>{choice}</span>
          </button>
        ))}
      </div>

      {/* 次へボタン */}
      {isAnswered && (
        <div className={styles.nextArea}>
          <Button
            onClick={handleNext}
            size="lg"
            fullWidth
            isLoading={isSubmitting}
          >
            {isLastQuestion ? '結果を見る' : '次の問題へ'}
          </Button>
        </div>
      )}
    </div>
  );
};
