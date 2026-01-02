/**
 * v4 GASテンプレート
 *
 * シンプルな4択クイズアプリ用
 * LLM呼び出し不要、スプレッドシート直結
 */

// ===========================================
// 設定
// ===========================================

const SHEET_NAMES = {
  QUESTIONS: 'Questions',
  USERS: 'Users',
  ANSWERS: 'Answers',
  SESSIONS: 'Sessions'
};

// 教科別制限時間（秒）
const TIME_LIMITS = {
  jp: 120,    // 国語: 2分
  math: 300,  // 算数: 5分
  sci: 180,   // 理科: 3分
  soc: 120    // 社会: 2分
};

// ===========================================
// エントリーポイント
// ===========================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('超天才クイズ v4');
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;

  let result;

  switch (action) {
    case 'login':
      result = login(params);
      break;
    case 'get_questions':
      result = getQuestions(params);
      break;
    case 'submit_answers':
      result = submitAnswers(params);
      break;
    case 'get_stats':
      result = getStats(params);
      break;
    case 'get_genres':
      result = getGenres(params);
      break;
    default:
      result = { success: false, error: 'Unknown action' };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ===========================================
// 認証
// ===========================================

function login(params) {
  const { username, password } = params;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username) {
      // TODO: bcrypt比較（フロントエンドで実施）
      return {
        success: true,
        user: {
          user_id: data[i][0],
          username: data[i][1],
          password_hash: data[i][2]  // フロントで検証
        }
      };
    }
  }

  return { success: false, error: 'User not found' };
}

// ===========================================
// 問題取得
// ===========================================

/**
 * 問題を取得
 * @param {Object} params - { subject, genre_id?, count? }
 */
function getQuestions(params) {
  const { subject, genre_id, count = 10 } = params;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.QUESTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // フィルタリング
  let questions = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const q = {
      question_id: row[0],
      subject: row[1],
      genre_id: row[2],
      genre_name: row[3],
      question_text: row[4],
      choices: parseChoices(row[5]),
      correct_index: row[6],
      hint: row[8]
    };

    if (q.subject === subject) {
      if (!genre_id || q.genre_id === genre_id) {
        questions.push(q);
      }
    }
  }

  // シャッフルして指定数を返す
  questions = shuffle(questions).slice(0, count);

  return {
    success: true,
    questions: questions,
    time_limit: TIME_LIMITS[subject] || 180
  };
}

/**
 * 利用可能なジャンル一覧を取得
 */
function getGenres(params) {
  const { subject } = params;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.QUESTIONS);
  const data = sheet.getDataRange().getValues();

  const genres = {};

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === subject) {
      const genre_id = data[i][2];
      const genre_name = data[i][3];
      if (!genres[genre_id]) {
        genres[genre_id] = {
          genre_id: genre_id,
          genre_name: genre_name,
          count: 0
        };
      }
      genres[genre_id].count++;
    }
  }

  return {
    success: true,
    genres: Object.values(genres)
  };
}

// ===========================================
// 回答保存
// ===========================================

/**
 * 回答を保存
 * @param {Object} params - { user_id, session_id, answers: [...] }
 */
function submitAnswers(params) {
  const { user_id, session_id, subject, answers, time_remaining } = params;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.ANSWERS);
  const sessionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.SESSIONS);

  const now = new Date().toISOString();
  let correctCount = 0;

  // 回答を保存
  answers.forEach((ans, idx) => {
    const isCorrect = ans.user_answer === ans.correct_index;
    if (isCorrect) correctCount++;

    sheet.appendRow([
      Utilities.getUuid(),  // answer_id
      user_id,
      session_id,
      ans.question_id,
      subject,
      ans.genre_id,
      ans.user_answer,
      isCorrect,
      ans.time_taken || 0,
      now
    ]);
  });

  // セッション保存
  sessionsSheet.appendRow([
    session_id,
    user_id,
    subject,
    '',  // genre_id
    answers.length,
    correctCount,
    TIME_LIMITS[subject] || 180,
    time_remaining || 0,
    now,
    now
  ]);

  return {
    success: true,
    correct_count: correctCount,
    total: answers.length,
    accuracy: correctCount / answers.length
  };
}

// ===========================================
// 統計取得
// ===========================================

function getStats(params) {
  const { user_id } = params;
  const answersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.ANSWERS);
  const data = answersSheet.getDataRange().getValues();

  const stats = {
    total_questions: 0,
    total_correct: 0,
    by_subject: {}
  };

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === user_id) {
      const subject = data[i][4];
      const isCorrect = data[i][7];

      stats.total_questions++;
      if (isCorrect) stats.total_correct++;

      if (!stats.by_subject[subject]) {
        stats.by_subject[subject] = { total: 0, correct: 0 };
      }
      stats.by_subject[subject].total++;
      if (isCorrect) stats.by_subject[subject].correct++;
    }
  }

  stats.overall_accuracy = stats.total_questions > 0
    ? stats.total_correct / stats.total_questions
    : 0;

  return { success: true, stats: stats };
}

// ===========================================
// ユーティリティ
// ===========================================

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseChoices(choices) {
  if (Array.isArray(choices)) return choices;
  if (typeof choices === 'string') {
    try {
      return JSON.parse(choices);
    } catch {
      return choices.split(',').map(s => s.trim());
    }
  }
  return [];
}
