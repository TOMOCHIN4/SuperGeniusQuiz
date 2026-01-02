/**
 * 超天才クイズ v4
 * GAS + Google Sheets
 */

// ===========================================
// 設定
// ===========================================

const SPREADSHEET_ID = '1BQpphBThc7AxFwaNhf5wGrj7Pj9adX4lZE4DKgI5XvM';

const SHEET_NAMES = {
  QUESTIONS: 'Questions',
  USERS: 'Users',
  ANSWERS: 'Answers',
  SESSIONS: 'Sessions'
};

const TIME_LIMITS = {
  jp: 120,
  math: 300,
  sci: 180,
  soc: 120,
  all: 300
};

// ===========================================
// シート初期化（手動実行用）
// ===========================================

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Questions シート
  let questionsSheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  if (!questionsSheet) {
    questionsSheet = ss.insertSheet(SHEET_NAMES.QUESTIONS);
  }
  questionsSheet.clear();
  questionsSheet.appendRow([
    'question_id', 'subject', 'genre_id', 'genre_name', 'question_text',
    'choices', 'correct_index', 'correct_answer', 'hint', 'difficulty',
    'created_at', 'updated_at'
  ]);

  // サンプル問題データ
  const sampleQuestions = [
    ['JP01_001', 'jp', 'JP01', '漢字・語彙', '「収穫」の読み方として正しいものはどれですか？',
     '["しゅうかく","しゅかく","すうかく","しゅうがく"]', 0, 'しゅうかく',
     '「収」は「しゅう」、「穫」は「かく」と読みます', 'normal', new Date().toISOString(), ''],
    ['MA01_001', 'math', 'MA01', '計算', '25 × 4 の答えはいくつですか？',
     '["100","90","110","80"]', 0, '100',
     '25を4回たすと考えましょう', 'easy', new Date().toISOString(), ''],
    ['SC07_001', 'sci', 'SC07', '植物', '光合成で植物が吸収する気体は何ですか？',
     '["二酸化炭素","酸素","窒素","水素"]', 0, '二酸化炭素',
     '植物は光を使って二酸化炭素と水から養分を作ります', 'normal', new Date().toISOString(), ''],
    ['SO04_001', 'soc', 'SO04', '歴史（古代〜平安）', '聖徳太子が定めた役人の心構えを示した法律は何ですか？',
     '["十七条の憲法","大宝律令","御成敗式目","武家諸法度"]', 0, '十七条の憲法',
     '「和を以て貴しとなす」という言葉が有名です', 'normal', new Date().toISOString(), ''],
    ['MA04_001', 'math', 'MA04', '速さ', '時速60kmで2時間走ると何km進みますか？',
     '["120km","60km","30km","180km"]', 0, '120km',
     '距離＝速さ×時間で計算します', 'normal', new Date().toISOString(), '']
  ];
  sampleQuestions.forEach(row => questionsSheet.appendRow(row));

  // Users シート
  let usersSheet = ss.getSheetByName(SHEET_NAMES.USERS);
  if (!usersSheet) {
    usersSheet = ss.insertSheet(SHEET_NAMES.USERS);
  }
  usersSheet.clear();
  usersSheet.appendRow(['user_id', 'username', 'password', 'created_at', 'last_login']);

  // サンプルユーザー（テスト用：パスワードは平文）
  const sampleUsers = [
    ['user001', 'テスト太郎', 'test123', new Date().toISOString(), ''],
    ['user002', 'テスト花子', 'test456', new Date().toISOString(), ''],
    ['user003', 'テスト次郎', 'test789', new Date().toISOString(), '']
  ];
  sampleUsers.forEach(row => usersSheet.appendRow(row));

  // Answers シート
  let answersSheet = ss.getSheetByName(SHEET_NAMES.ANSWERS);
  if (!answersSheet) {
    answersSheet = ss.insertSheet(SHEET_NAMES.ANSWERS);
  }
  answersSheet.clear();
  answersSheet.appendRow([
    'answer_id', 'user_id', 'session_id', 'question_id', 'subject',
    'genre_id', 'user_answer', 'is_correct', 'time_taken', 'answered_at'
  ]);

  // Sessions シート
  let sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  if (!sessionsSheet) {
    sessionsSheet = ss.insertSheet(SHEET_NAMES.SESSIONS);
  }
  sessionsSheet.clear();
  sessionsSheet.appendRow([
    'session_id', 'user_id', 'subject', 'genre_id', 'total_questions',
    'correct_count', 'time_limit', 'time_remaining', 'started_at', 'finished_at'
  ]);

  // デフォルトの「シート1」を削除
  const sheet1 = ss.getSheetByName('シート1');
  if (sheet1) {
    ss.deleteSheet(sheet1);
  }

  Logger.log('シート初期化完了');
  return 'シート初期化完了';
}

// ===========================================
// スキーマ移行（手動実行用）
// ===========================================

/**
 * 既存のQuestionsシートに import_batch_id, usage_count カラムを追加
 * GASエディタから1回だけ実行する
 */
function migrateQuestionsSchema() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const data = sheet.getDataRange().getValues();

  // ヘッダー確認
  const headers = data[0];
  const hasImportBatchId = headers.includes('import_batch_id');
  const hasUsageCount = headers.includes('usage_count');

  if (hasImportBatchId && hasUsageCount) {
    Logger.log('既にカラムが存在します。移行不要です。');
    return '既にカラムが存在します';
  }

  // 新しいヘッダーを追加
  const newHeaders = [...headers];
  if (!hasImportBatchId) newHeaders.push('import_batch_id');
  if (!hasUsageCount) newHeaders.push('usage_count');

  // 既存データに初期値を設定
  const newData = [newHeaders];
  for (let i = 1; i < data.length; i++) {
    const row = [...data[i]];
    if (!hasImportBatchId) row.push('initial');  // 既存データは "initial" バッチ
    if (!hasUsageCount) row.push(0);             // 出題回数は0
    newData.push(row);
  }

  // シートを更新
  sheet.clear();
  sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);

  Logger.log(`移行完了: ${data.length - 1}問に新カラムを追加しました`);
  return `移行完了: ${data.length - 1}問に新カラムを追加しました`;
}

// ===========================================
// エントリーポイント
// ===========================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('超天才クイズ v4')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
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
      case 'import_questions':
        result = importQuestionsFromAPI(params);
        break;
      case 'get_recent_imports':
        result = getRecentImports(params);
        break;
      case 'add_user':
        result = addUser(params);
        break;
      case 'get_history':
        result = getHistory(params);
        break;
      case 'create_book':
        result = createBook(params);
        break;
      case 'get_books':
        result = getBooks(params);
        break;
      case 'get_book_questions':
        result = getBookQuestions(params);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===========================================
// 認証
// ===========================================

function login(params) {
  const { username, password } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username && data[i][2] === password) {
      // 最終ログイン日時を更新
      sheet.getRange(i + 1, 5).setValue(new Date().toISOString());

      return {
        success: true,
        user: {
          user_id: data[i][0],
          username: data[i][1]
        }
      };
    }
  }

  return { success: false, error: 'ユーザー名またはパスワードが違います' };
}

/**
 * ユーザーを追加（API経由）
 * @param {Object} params - { username, password }
 */
function addUser(params) {
  const { username, password } = params;

  if (!username || !password) {
    return { success: false, error: 'ユーザー名とパスワードが必要です' };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();

  // 重複チェック
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === username) {
      return { success: false, error: 'このユーザー名は既に使用されています' };
    }
  }

  // user_id を自動採番（user001, user002, ... の形式）
  let maxNum = 0;
  for (let i = 1; i < data.length; i++) {
    const userId = data[i][0];
    if (userId && userId.startsWith('user')) {
      const num = parseInt(userId.replace('user', ''), 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const newUserId = `user${String(maxNum + 1).padStart(3, '0')}`;

  // ユーザーを追加（パスワードは文字列として保存）
  const now = new Date().toISOString();
  const newRow = sheet.getLastRow() + 1;
  sheet.appendRow([newUserId, username, '', now, '']);
  // パスワードを文字列として明示的に設定（先頭の0が消えないように）
  sheet.getRange(newRow, 3).setNumberFormat('@').setValue(String(password));

  return {
    success: true,
    user_id: newUserId,
    username: username,
    message: `ユーザー「${username}」を追加しました`
  };
}

// ===========================================
// 問題取得（usage_count考慮 + batch_idフィルタ対応）
// ===========================================

function getQuestions(params) {
  const { subject, genre_id, batch_id, count = 10 } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // カラムインデックスを取得
  const colIndex = {
    import_batch_id: headers.indexOf('import_batch_id'),
    usage_count: headers.indexOf('usage_count')
  };

  let questions = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const q = {
      row_index: i + 1,  // シート上の行番号（1-indexed）
      question_id: row[0],
      subject: row[1],
      genre_id: row[2],
      genre_name: row[3],
      question_text: row[4],
      choices: parseChoices(row[5]),
      correct_index: row[6],
      hint: row[8],
      import_batch_id: colIndex.import_batch_id >= 0 ? row[colIndex.import_batch_id] : 'initial',
      usage_count: colIndex.usage_count >= 0 ? (row[colIndex.usage_count] || 0) : 0
    };

    // フィルタリング
    const matchSubject = subject === 'all' || q.subject === subject;
    const matchGenre = !genre_id || q.genre_id === genre_id;
    const matchBatch = !batch_id || q.import_batch_id === batch_id;

    if (matchSubject && matchGenre && matchBatch) {
      questions.push(q);
    }
  }

  // usage_count でソート（昇順）、同一 usage_count 内はシャッフル
  questions = sortByUsageCountWithShuffle(questions);

  // 上位N問を選択
  const selected = questions.slice(0, count);

  // 選択した問題の usage_count を +1（非同期で更新）
  if (colIndex.usage_count >= 0 && selected.length > 0) {
    incrementUsageCount(sheet, selected, colIndex.usage_count);
  }

  // row_index を除去してクライアントに返す
  const result = selected.map(q => {
    const { row_index, usage_count, import_batch_id, ...rest } = q;
    return rest;
  });

  return {
    success: true,
    questions: result,
    time_limit: TIME_LIMITS[subject] || 180
  };
}

/**
 * usage_count でソートし、同一 usage_count 内はシャッフル
 */
function sortByUsageCountWithShuffle(questions) {
  // usage_count でグループ化
  const groups = {};
  questions.forEach(q => {
    const key = q.usage_count || 0;
    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  });

  // 各グループをシャッフルして、usage_count 昇順で結合
  const sortedKeys = Object.keys(groups).map(Number).sort((a, b) => a - b);
  let result = [];
  sortedKeys.forEach(key => {
    result = result.concat(shuffle(groups[key]));
  });

  return result;
}

/**
 * 選択した問題の usage_count を +1
 */
function incrementUsageCount(sheet, questions, usageCountCol) {
  questions.forEach(q => {
    const currentValue = sheet.getRange(q.row_index, usageCountCol + 1).getValue() || 0;
    sheet.getRange(q.row_index, usageCountCol + 1).setValue(currentValue + 1);
  });
}

function getGenres(params) {
  const { subject } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
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

function submitAnswers(params) {
  const { user_id, session_id, subject, answers, time_remaining } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const answersSheet = ss.getSheetByName(SHEET_NAMES.ANSWERS);
  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);

  const now = new Date().toISOString();
  let correctCount = 0;

  answers.forEach((ans) => {
    const isCorrect = ans.user_answer === ans.correct_index;
    if (isCorrect) correctCount++;

    answersSheet.appendRow([
      Utilities.getUuid(),
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

  sessionsSheet.appendRow([
    session_id,
    user_id,
    subject,
    '',
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
    accuracy: answers.length > 0 ? correctCount / answers.length : 0
  };
}

// ===========================================
// 統計取得
// ===========================================

function getStats(params) {
  const { user_id } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const answersSheet = ss.getSheetByName(SHEET_NAMES.ANSWERS);
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
// 履歴取得
// ===========================================

function getHistory(params) {
  const { user_id, limit = 20 } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sessionsSheet = ss.getSheetByName(SHEET_NAMES.SESSIONS);
  const data = sessionsSheet.getDataRange().getValues();

  // ヘッダー: session_id, user_id, subject, genre_id, total_questions, correct_count, time_limit, time_remaining, started_at, finished_at
  const history = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === user_id) {
      history.push({
        session_id: data[i][0],
        subject: data[i][2],
        genre_id: data[i][3],
        total_questions: data[i][4],
        correct_count: data[i][5],
        time_limit: data[i][6],
        time_remaining: data[i][7],
        started_at: data[i][8],
        finished_at: data[i][9]
      });
    }
  }

  // 日付でソート（新しい順）
  history.sort((a, b) => {
    const dateA = new Date(a.finished_at || a.started_at);
    const dateB = new Date(b.finished_at || b.started_at);
    return dateB - dateA;
  });

  return {
    success: true,
    history: history.slice(0, limit)
  };
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
    } catch (e) {
      return choices.split(',').map(s => s.trim());
    }
  }
  return [];
}

// ===========================================
// 問題データインポート
// ===========================================

/**
 * 問題データを一括追加（既存データは保持）
 * import_batch_id と usage_count に対応
 * question_id は自動採番（空または重複の場合）
 * @param {Array} questions - 問題オブジェクトの配列
 * @param {string} batchId - インポートバッチID（省略時は自動生成）
 */
function importQuestions(questions, batchId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const now = new Date().toISOString();

  // バッチID生成（省略時は現在日時から生成）
  if (!batchId) {
    const d = new Date();
    batchId = `batch_${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // 既存IDを取得してgenre_idごとの最大番号を計算
  const existingIds = getExistingQuestionIds(sheet);
  const maxNumbers = calcMaxNumbersByGenre(existingIds);

  const generatedIds = [];

  questions.forEach(q => {
    // question_id の自動採番（空、または既存IDと重複の場合）
    let questionId = q.question_id;
    if (!questionId || existingIds.has(questionId)) {
      questionId = generateNextQuestionId(q.genre_id, maxNumbers, existingIds);
    }
    existingIds.add(questionId);  // 今回追加したIDも重複チェック対象に
    generatedIds.push(questionId);

    sheet.appendRow([
      questionId,
      q.subject,
      q.genre_id,
      q.genre_name,
      q.question_text,
      JSON.stringify(q.choices),
      q.correct_index,
      q.correct_answer,
      q.hint || '',
      q.difficulty || 'normal',
      now,
      '',
      batchId,  // import_batch_id
      0         // usage_count（初期値0）
    ]);
  });

  Logger.log(`${questions.length}問を追加しました（バッチID: ${batchId}）`);
  Logger.log(`生成されたID: ${generatedIds.join(', ')}`);
  return { count: questions.length, batch_id: batchId, generated_ids: generatedIds };
}

/**
 * 既存のquestion_idをSetで取得
 */
function getExistingQuestionIds(sheet) {
  const data = sheet.getDataRange().getValues();
  const ids = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      ids.add(data[i][0]);
    }
  }
  return ids;
}

/**
 * genre_idごとの最大番号を計算
 * 例: { "JP01": 5, "MA04": 3, "SO10": 0 }
 */
function calcMaxNumbersByGenre(existingIds) {
  const maxNumbers = {};
  existingIds.forEach(id => {
    const match = id.match(/^([A-Z]{2}\d{2})_(\d+)$/);
    if (match) {
      const genreId = match[1];
      const num = parseInt(match[2], 10);
      if (!maxNumbers[genreId] || num > maxNumbers[genreId]) {
        maxNumbers[genreId] = num;
      }
    }
  });
  return maxNumbers;
}

/**
 * 次のquestion_idを生成
 * 例: genre_id="SO10", 現在最大=3 → "SO10_004"
 */
function generateNextQuestionId(genreId, maxNumbers, existingIds) {
  let nextNum = (maxNumbers[genreId] || 0) + 1;
  let newId;

  // 万が一重複があれば次の番号へ
  do {
    newId = `${genreId}_${String(nextNum).padStart(3, '0')}`;
    nextNum++;
  } while (existingIds.has(newId));

  // maxNumbersも更新
  maxNumbers[genreId] = nextNum - 1;

  return newId;
}

/**
 * API経由で問題をインポート（doPostから呼び出し）
 * question_id は省略可能（自動採番）
 */
function importQuestionsFromAPI(params) {
  const { questions, batch_id } = params;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return { success: false, error: '問題データが必要です' };
  }

  // バリデーション（question_id は自動採番のため必須から除外）
  const requiredFields = ['subject', 'genre_id', 'genre_name', 'question_text', 'choices', 'correct_index', 'correct_answer'];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    for (const field of requiredFields) {
      if (q[field] === undefined || q[field] === null) {
        return { success: false, error: `問題 ${i + 1} に ${field} がありません` };
      }
    }
  }

  const result = importQuestions(questions, batch_id);

  return {
    success: true,
    batch_id: result.batch_id,
    imported_count: result.count,
    generated_ids: result.generated_ids,
    message: `${result.count}問をインポートしました`
  };
}

/**
 * 直近のインポートバッチを取得
 */
function getRecentImports(params) {
  const { limit = 5 } = params;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.QUESTIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const batchIdCol = headers.indexOf('import_batch_id');
  const createdAtCol = headers.indexOf('created_at');
  const subjectCol = headers.indexOf('subject');

  if (batchIdCol < 0) {
    return { success: false, error: 'import_batch_id カラムがありません。migrateQuestionsSchema() を実行してください。' };
  }

  // バッチごとに集計
  const batches = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const batchId = row[batchIdCol] || 'initial';
    const createdAt = row[createdAtCol];
    const subject = row[subjectCol];

    if (!batches[batchId]) {
      batches[batchId] = {
        batch_id: batchId,
        count: 0,
        subjects: {},
        created_at: createdAt
      };
    }
    batches[batchId].count++;
    batches[batchId].subjects[subject] = (batches[batchId].subjects[subject] || 0) + 1;

    // 最新の created_at を使用
    if (createdAt && createdAt > batches[batchId].created_at) {
      batches[batchId].created_at = createdAt;
    }
  }

  // 日付でソート（新しい順）、initial は除外
  let batchList = Object.values(batches)
    .filter(b => b.batch_id !== 'initial')
    .sort((a, b) => {
      if (!a.created_at) return 1;
      if (!b.created_at) return -1;
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, limit);

  // subjects を配列に変換
  batchList = batchList.map(b => ({
    batch_id: b.batch_id,
    count: b.count,
    subjects: Object.entries(b.subjects).map(([s, c]) => ({ subject: s, count: c })),
    created_at: b.created_at
  }));

  return {
    success: true,
    imports: batchList
  };
}

/**
 * 40問データをインポート（GASエディタから実行）
 */
function import40Questions() {
  const questions = [
    {question_id:"JP01_001",subject:"jp",genre_id:"JP01",genre_name:"漢字・語彙",question_text:"「潔い」の正しい読み方はどれですか。",choices:["きよい","いさぎよい","はげしい","うつくしい"],correct_index:1,correct_answer:"いさぎよい",hint:"「潔」は清潔（せいけつ）の潔でもありますが、送り仮名が「い」の場合は「いさぎよい」と読みます。",difficulty:"normal"},
    {question_id:"JP01_002",subject:"jp",genre_id:"JP01",genre_name:"漢字・語彙",question_text:"「賛成」の対義語（反対の意味の言葉）はどれですか。",choices:["協力","納得","反対","議論"],correct_index:2,correct_answer:"反対",hint:"「賛成」は同意すること、「反対」は同意しないことを表します。",difficulty:"easy"},
    {question_id:"JP01_003",subject:"jp",genre_id:"JP01",genre_name:"漢字・語彙",question_text:"「気が置けない」という慣用句の意味として正しいものはどれですか。",choices:["油断できない","遠慮しなくてよい","信用できない","気配りができない"],correct_index:1,correct_answer:"遠慮しなくてよい",hint:"「気が置けない」は、相手に気を使わなくてよい、親しい間柄であることを意味します。",difficulty:"hard"},
    {question_id:"JP02_001",subject:"jp",genre_id:"JP02",genre_name:"文法・言葉のきまり",question_text:"「白い犬が走る」の文の中で、「白い」の品詞はどれですか。",choices:["動詞","名詞","形容詞","副詞"],correct_index:2,correct_answer:"形容詞",hint:"「〜い」で終わり、名詞（犬）を詳しく説明する言葉は形容詞です。",difficulty:"normal"},
    {question_id:"JP02_002",subject:"jp",genre_id:"JP02",genre_name:"文法・言葉のきまり",question_text:"次の文のうち、「受け身（受動態）」の文はどれですか。",choices:["弟がケーキを食べた。","姉は本を読んでいる。","先生にほめられた。","私は明日、海に行く。"],correct_index:2,correct_answer:"先生にほめられた。",hint:"「〜れる・〜られる」を使い、相手から何かをされることを表す文を受け身といいます。",difficulty:"normal"},
    {question_id:"JP03_001",subject:"jp",genre_id:"JP03",genre_name:"物語文読解",question_text:"「まるで氷のように冷たい手」という表現で使われている技法はどれですか。",choices:["擬人法","直喩（たとえ）","倒置法","反復法"],correct_index:1,correct_answer:"直喩（たとえ）",hint:"「まるで〜のようだ」を使って、あるものを別のものに例える技法を直喩（ちょくゆ）といいます。",difficulty:"normal"},
    {question_id:"JP03_002",subject:"jp",genre_id:"JP03",genre_name:"物語文読解",question_text:"物語文で、登場人物が「くちびるをかんだ」時の気持ちとして、最も適切なものはどれですか。",choices:["うれしい","くやしい","たのしい","眠い"],correct_index:1,correct_answer:"くやしい",hint:"「くちびるをかむ」は、悔しさや怒りをこらえている時の動作としてよく使われます。",difficulty:"easy"},
    {question_id:"JP04_001",subject:"jp",genre_id:"JP04",genre_name:"説明文・論説文読解",question_text:"前の文と反対の内容を述べる時に使う接続詞はどれですか。",choices:["つまり","だから","しかし","および"],correct_index:2,correct_answer:"しかし",hint:"「しかし」は逆接の接続詞で、前の内容と対立する内容を続ける時に使います。",difficulty:"easy"},
    {question_id:"JP04_002",subject:"jp",genre_id:"JP04",genre_name:"説明文・論説文読解",question_text:"説明文の構成で、最初に話題を示し、読者の興味を引く部分はどこですか。",choices:["序論（はじめ）","本論（なか）","結論（おわり）","推論（まとめ）"],correct_index:0,correct_answer:"序論（はじめ）",hint:"説明文は一般的に「序論（はじめ）→本論（なか）→結論（おわり）」の順で構成されます。",difficulty:"normal"},
    {question_id:"JP08_001",subject:"jp",genre_id:"JP08",genre_name:"知識・文学史",question_text:"俳句を作る時に必要な、季節を表す言葉を何といいますか。",choices:["季語","枕詞","五七五","定型"],correct_index:0,correct_answer:"季語",hint:"俳句には必ず一つ、季節を表す「季語」を入れる約束があります。",difficulty:"easy"},
    {question_id:"MA01_001",subject:"math",genre_id:"MA01",genre_name:"計算",question_text:"「5 + 3 × 2」の答えはいくつですか。",choices:["16","11","13","10"],correct_index:1,correct_answer:"11",hint:"足し算とかけ算が混ざっているときは、かけ算を先に計算します（3×2=6, 5+6=11）。",difficulty:"easy"},
    {question_id:"MA01_002",subject:"math",genre_id:"MA01",genre_name:"計算",question_text:"「1/2 + 1/3」の計算結果として正しいものはどれですか。",choices:["2/5","1/5","5/6","1/6"],correct_index:2,correct_answer:"5/6",hint:"分母が違う分数の足し算は、通分して分母をそろえてから計算します（3/6 + 2/6）。",difficulty:"normal"},
    {question_id:"MA02_001",subject:"math",genre_id:"MA02",genre_name:"数の性質",question_text:"次の数のうち、「素数」であるものはどれですか。",choices:["4","7","9","15"],correct_index:1,correct_answer:"7",hint:"素数は、1とその数自身でしか割ることのできない数です。7の約数は1と7だけです。",difficulty:"normal"},
    {question_id:"MA03_001",subject:"math",genre_id:"MA03",genre_name:"割合・比",question_text:"「定価1000円の20%引き」の値段はいくらですか。",choices:["200円","800円","820円","980円"],correct_index:1,correct_answer:"800円",hint:"1000円の20%は200円です。引くので、1000 - 200 = 800円になります。",difficulty:"normal"},
    {question_id:"MA03_002",subject:"math",genre_id:"MA03",genre_name:"割合・比",question_text:"「2 : 3」と等しい比はどれですか。",choices:["4 : 5","4 : 6","5 : 6","6 : 8"],correct_index:1,correct_answer:"4 : 6",hint:"比の両方の数に同じ数をかけても比は等しくなります。2×2 : 3×2 = 4 : 6 です。",difficulty:"easy"},
    {question_id:"MA04_001",subject:"math",genre_id:"MA04",genre_name:"速さ",question_text:"時速60kmで2時間走った時の道のりは何kmですか。",choices:["30km","62km","120km","180km"],correct_index:2,correct_answer:"120km",hint:"道のり＝速さ×時間 です。60 × 2 ＝ 120kmになります。",difficulty:"easy"},
    {question_id:"MA04_002",subject:"math",genre_id:"MA04",genre_name:"速さ",question_text:"150mの道のりを50秒で歩きました。この時の分速は何mですか。",choices:["分速3m","分速50m","分速180m","分速300m"],correct_index:2,correct_answer:"分速180m",hint:"まず秒速を求めます（150÷50=3m/秒）。分速にするには60倍します（3×60=180m/分）。",difficulty:"hard"},
    {question_id:"MA06_001",subject:"math",genre_id:"MA06",genre_name:"平面図形",question_text:"三角形の面積を求める公式はどれですか。",choices:["底辺×高さ","底辺×高さ÷2","（上底＋下底）×高さ÷2","半径×半径×3.14"],correct_index:1,correct_answer:"底辺×高さ÷2",hint:"三角形の面積は、平行四辺形の面積（底辺×高さ）の半分になります。",difficulty:"easy"},
    {question_id:"MA06_002",subject:"math",genre_id:"MA06",genre_name:"平面図形",question_text:"四角形の内角の和（4つの角の合計）は何度ですか。",choices:["180度","360度","540度","720度"],correct_index:1,correct_answer:"360度",hint:"四角形は対角線で2つの三角形に分けられるので、180度×2＝360度になります。",difficulty:"normal"},
    {question_id:"MA08_001",subject:"math",genre_id:"MA08",genre_name:"場合の数・確率",question_text:"10円玉を1回投げた時、表が出る確率はいくつですか。",choices:["1/2","1/3","1/4","1/10"],correct_index:0,correct_answer:"1/2",hint:"表と裏の2通りの出方があり、どちらが出ることも同様に確からしいので1/2です。",difficulty:"easy"},
    {question_id:"SC01_001",subject:"sci",genre_id:"SC01",genre_name:"力・運動",question_text:"ふりこの1往復する時間を変えるために変える必要がある条件はどれですか。",choices:["おもりの重さ","ふりこの長さ","ふれはば","ふりこの色"],correct_index:1,correct_answer:"ふりこの長さ",hint:"ふりこの周期（1往復の時間）は、ふりこの長さによって決まり、おもりの重さやふれはばには関係ありません。",difficulty:"normal"},
    {question_id:"SC02_001",subject:"sci",genre_id:"SC02",genre_name:"電気",question_text:"電磁石の力を強くする方法として正しいものはどれですか。",choices:["電池の数を減らす","コイルの巻き数を増やす","細い導線に変える","コイルの中に木を入れる"],correct_index:1,correct_answer:"コイルの巻き数を増やす",hint:"電磁石は、流れる電流を大きくするか、コイルの巻き数を増やすと強くなります。",difficulty:"normal"},
    {question_id:"SC04_001",subject:"sci",genre_id:"SC04",genre_name:"物質の性質",question_text:"水が沸騰して出てくる泡の正体は何ですか。",choices:["空気","水蒸気","酸素","水素"],correct_index:1,correct_answer:"水蒸気",hint:"沸騰すると、水（液体）が水蒸気（気体）に変化して泡となって出てきます。",difficulty:"easy"},
    {question_id:"SC05_001",subject:"sci",genre_id:"SC05",genre_name:"水溶液",question_text:"青色のリトマス紙を赤色に変える水溶液の性質は何ですか。",choices:["酸性","中性","アルカリ性","磁性"],correct_index:0,correct_answer:"酸性",hint:"リトマス紙の変化は、酸性が「青→赤」、アルカリ性が「赤→青」です。",difficulty:"normal"},
    {question_id:"SC07_001",subject:"sci",genre_id:"SC07",genre_name:"植物",question_text:"植物が日光を受けて養分（デンプン）を作る働きを何といいますか。",choices:["呼吸","蒸散","光合成","発芽"],correct_index:2,correct_answer:"光合成",hint:"植物は葉緑体で日光のエネルギーを使い、二酸化炭素と水から養分を作ります。これを光合成といいます。",difficulty:"easy"},
    {question_id:"SC07_002",subject:"sci",genre_id:"SC07",genre_name:"植物",question_text:"種子が発芽するために必要な3つの条件に含まれないものはどれですか。",choices:["水","空気","適当な温度","日光"],correct_index:3,correct_answer:"日光",hint:"発芽の3条件は「水・空気・適当な温度」です。多くの種子で、発芽の瞬間に日光は必要ありません。",difficulty:"hard"},
    {question_id:"SC08_001",subject:"sci",genre_id:"SC08",genre_name:"動物",question_text:"メダカのオスとメスを見分ける時、注目するひれはどれですか。",choices:["背びれと尻びれ","胸びれと腹びれ","尾びれ","すべてのひれ"],correct_index:0,correct_answer:"背びれと尻びれ",hint:"オスの背びれには切れ込みがあり、尻びれは平行四辺形に近い形をしています。",difficulty:"normal"},
    {question_id:"SC08_002",subject:"sci",genre_id:"SC08",genre_name:"動物",question_text:"人の体で、食べ物の養分を主に吸収している内臓はどこですか。",choices:["胃","小腸","大腸","肝臓"],correct_index:1,correct_answer:"小腸",hint:"胃で消化された食べ物は、小腸を通る間に分解され、柔毛から養分が吸収されます。",difficulty:"normal"},
    {question_id:"SC10_001",subject:"sci",genre_id:"SC10",genre_name:"天体",question_text:"太陽、地球、月が一直線に並び、地球が真ん中にある時、月から見ると太陽の光が当たって輝いて見えます。この時の月を何といいますか。",choices:["新月","上弦の月","満月","三日月"],correct_index:2,correct_answer:"満月",hint:"太陽の光を正面から受けている面が地球に向いているため、丸く見えます。",difficulty:"normal"},
    {question_id:"SC11_001",subject:"sci",genre_id:"SC11",genre_name:"気象",question_text:"夏によく発生する、背が高く盛り上がった形をした雲（入道雲）の正式な名前はどれですか。",choices:["積乱雲","巻雲","層雲","高積雲"],correct_index:0,correct_answer:"積乱雲",hint:"強い上昇気流によって縦に長く発達した雲で、雷雨や夕立をもたらします。",difficulty:"normal"},
    {question_id:"SO01_001",subject:"soc",genre_id:"SO01",genre_name:"日本地理（国土・自然）",question_text:"日本で一番長い川はどれですか。",choices:["利根川","石狩川","信濃川","四万十川"],correct_index:2,correct_answer:"信濃川",hint:"信濃川（長野県〜新潟県）が日本一長く、利根川は流域面積が日本一です。",difficulty:"easy"},
    {question_id:"SO01_002",subject:"soc",genre_id:"SO01",genre_name:"日本地理（国土・自然）",question_text:"日本で最も広い平野はどこですか。",choices:["石狩平野","大阪平野","濃尾平野","関東平野"],correct_index:3,correct_answer:"関東平野",hint:"関東地方に広がる関東平野が日本で最も面積が広いです。",difficulty:"easy"},
    {question_id:"SO02_001",subject:"soc",genre_id:"SO02",genre_name:"日本地理（産業）",question_text:"日本の稲作が盛んな地域として有名な「庄内平野」がある都道府県はどこですか。",choices:["秋田県","山形県","新潟県","北海道"],correct_index:1,correct_answer:"山形県",hint:"庄内平野は山形県にあり、最上川の豊かな水を利用した米作りが盛んです。",difficulty:"hard"},
    {question_id:"SO04_001",subject:"soc",genre_id:"SO04",genre_name:"歴史（古代〜平安）",question_text:"弥生時代に大陸から伝わり、人々の生活を大きく変えたものは何ですか。",choices:["鉄砲","仏教","稲作","漢字"],correct_index:2,correct_answer:"稲作",hint:"稲作が始まったことで、定住生活が進み、貧富の差や「むら」「くに」が生まれました。",difficulty:"normal"},
    {question_id:"SO04_002",subject:"soc",genre_id:"SO04",genre_name:"歴史（古代〜平安）",question_text:"平安時代に「源氏物語」を書いた人物は誰ですか。",choices:["清少納言","紫式部","卑弥呼","北条政子"],correct_index:1,correct_answer:"紫式部",hint:"紫式部は一条天皇の中宮彰子に仕え、源氏物語を書きました。清少納言は枕草子の作者です。",difficulty:"normal"},
    {question_id:"SO05_001",subject:"soc",genre_id:"SO05",genre_name:"歴史（鎌倉〜室町）",question_text:"1192年（現在は1185年説が有力）に鎌倉幕府を開いた人物は誰ですか。",choices:["平清盛","源義経","源頼朝","足利尊氏"],correct_index:2,correct_answer:"源頼朝",hint:"源平の戦いに勝利し、鎌倉（神奈川県）に武士の政権である幕府を開きました。",difficulty:"easy"},
    {question_id:"SO05_002",subject:"soc",genre_id:"SO05",genre_name:"歴史（鎌倉〜室町）",question_text:"室町時代、足利義満が京都の北山に建てた建物は何ですか。",choices:["金閣（鹿苑寺）","銀閣（慈照寺）","東大寺大仏殿","法隆寺"],correct_index:0,correct_answer:"金閣（鹿苑寺）",hint:"3代将軍足利義満は金閣を建てました。8代将軍義政が建てたのが銀閣です。",difficulty:"normal"},
    {question_id:"SO06_001",subject:"soc",genre_id:"SO06",genre_name:"歴史（安土桃山〜江戸）",question_text:"江戸幕府を開き、260年続く平和な時代の基礎を築いた人物は誰ですか。",choices:["織田信長","豊臣秀吉","徳川家康","徳川慶喜"],correct_index:2,correct_answer:"徳川家康",hint:"関ヶ原の戦いに勝利した後、1603年に征夷大将軍となり江戸幕府を開きました。",difficulty:"easy"},
    {question_id:"SO06_002",subject:"soc",genre_id:"SO06",genre_name:"歴史（安土桃山〜江戸）",question_text:"大名に1年おきに江戸と領地を行き来させた制度を何といいますか。",choices:["刀狩","検地","鎖国","参勤交代"],correct_index:3,correct_answer:"参勤交代",hint:"3代将軍家光の時に制度化され、大名の経済力を弱め、幕府への忠誠を誓わせる目的がありました。",difficulty:"normal"},
    {question_id:"SO08_001",subject:"soc",genre_id:"SO08",genre_name:"公民（政治・憲法）",question_text:"国の政治の仕組みで、法律を作る機関（立法権を持つ機関）はどこですか。",choices:["国会","内閣","裁判所","市役所"],correct_index:0,correct_answer:"国会",hint:"国権の最高機関であり、国の唯一の立法機関と日本国憲法で定められています。",difficulty:"normal"}
  ];

  return importQuestions(questions);
}

// ===========================================
// HTMLからの呼び出し用
// ===========================================

function processAction(params) {
  const action = params.action;

  switch (action) {
    case 'login':
      return login(params);
    case 'get_questions':
      return getQuestions(params);
    case 'submit_answers':
      return submitAnswers(params);
    case 'get_stats':
      return getStats(params);
    case 'get_genres':
      return getGenres(params);
    case 'get_recent_imports':
      return getRecentImports(params);
    default:
      return { success: false, error: 'Unknown action: ' + action };
  }
}

// ===========================================
// 参考書管理（Book Management）
// ===========================================

/**
 * 参考書シートを作成
 * @param {Object} params - { subject: 'jp'|'math'|'sci'|'soc', title: '参考書名', questions?: [] }
 */
function createBook(params) {
  const { subject, title, questions = [] } = params;

  // バリデーション
  const validSubjects = ['jp', 'math', 'sci', 'soc'];
  if (!validSubjects.includes(subject)) {
    return { success: false, error: `教科は ${validSubjects.join(', ')} のいずれかを指定してください` };
  }
  if (!title || title.trim() === '') {
    return { success: false, error: '参考書名を指定してください' };
  }

  const sheetName = `${subject}_${title}`;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // 既存シートチェック
  if (ss.getSheetByName(sheetName)) {
    return { success: false, error: `シート「${sheetName}」は既に存在します` };
  }

  // シート作成
  const sheet = ss.insertSheet(sheetName);

  // ヘッダー設定（usage_count追加）
  const headers = ['question_id', 'question_text', 'choice_1', 'choice_2', 'choice_3', 'choice_4', 'correct_index', 'hint', 'usage_count'];
  sheet.appendRow(headers);

  // 問題データがあれば追加
  let addedCount = 0;
  if (questions && questions.length > 0) {
    questions.forEach((q, index) => {
      const questionId = index + 1;
      sheet.appendRow([
        questionId,
        q.question_text || '',
        q.choice_1 || q.choices?.[0] || '',
        q.choice_2 || q.choices?.[1] || '',
        q.choice_3 || q.choices?.[2] || '',
        q.choice_4 || q.choices?.[3] || '',
        q.correct_index ?? 1,
        q.hint || '',
        0  // usage_count 初期値
      ]);
      addedCount++;
    });
  }

  Logger.log(`参考書「${sheetName}」を作成しました（問題数: ${addedCount}）`);

  return {
    success: true,
    book_id: sheetName,
    subject: subject,
    title: title,
    question_count: addedCount,
    message: `参考書「${title}」を作成しました`
  };
}

/**
 * 参考書一覧を取得（シート名から自動認識）
 * @param {Object} params - { subject?: 'jp'|'math'|'sci'|'soc', user_id?: string } 省略時は全教科
 */
function getBooks(params) {
  const { subject, user_id } = params || {};
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  const validSubjects = ['jp', 'math', 'sci', 'soc'];
  const bookPattern = /^(jp|math|sci|soc)_(.+)$/;

  // user_idがある場合、参考書ごとの統計を計算
  let bookStats = {};
  if (user_id) {
    bookStats = getBookStats(user_id);
  }

  const books = [];

  sheets.forEach(sheet => {
    const name = sheet.getName();
    const match = name.match(bookPattern);

    if (match) {
      const bookSubject = match[1];
      const bookTitle = match[2];

      // 教科フィルタ
      if (subject && bookSubject !== subject) {
        return;
      }

      // 問題数をカウント（ヘッダー行を除く）
      const lastRow = sheet.getLastRow();
      const questionCount = lastRow > 1 ? lastRow - 1 : 0;

      // 統計情報を追加
      const stats = bookStats[name] || { total: 0, correct: 0, accuracy: 0 };

      books.push({
        book_id: name,
        subject: bookSubject,
        title: bookTitle,
        question_count: questionCount,
        answered_count: stats.total,
        correct_count: stats.correct,
        accuracy: stats.accuracy
      });
    }
  });

  // タイトルでソート
  books.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  return {
    success: true,
    books: books,
    total: books.length
  };
}

/**
 * ユーザーの参考書ごとの統計を取得
 * @param {string} user_id
 * @returns {Object} { 'jp_参考書名': { total, correct, accuracy }, ... }
 */
function getBookStats(user_id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const answersSheet = ss.getSheetByName(SHEET_NAMES.ANSWERS);
  const data = answersSheet.getDataRange().getValues();

  // Answersシートの列: answer_id, user_id, session_id, question_id, subject, genre_id, user_answer, is_correct, time_taken, answered_at
  const stats = {};

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === user_id) {
      const genreId = data[i][5];  // genre_id列にbook_idが入っている
      const isCorrect = data[i][7];

      // 参考書パターンにマッチする場合のみ集計
      if (/^(jp|math|sci|soc)_/.test(genreId)) {
        if (!stats[genreId]) {
          stats[genreId] = { total: 0, correct: 0 };
        }
        stats[genreId].total++;
        if (isCorrect) stats[genreId].correct++;
      }
    }
  }

  // 正答率を計算
  Object.keys(stats).forEach(key => {
    const s = stats[key];
    s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  });

  return stats;
}

/**
 * 参考書から問題を取得（usage_count考慮）
 * @param {Object} params - { book_id: 'jp_参考書名', count?: 10 }
 */
function getBookQuestions(params) {
  const { book_id, count = 10 } = params;

  if (!book_id) {
    return { success: false, error: 'book_idを指定してください' };
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(book_id);

  if (!sheet) {
    return { success: false, error: `参考書「${book_id}」が見つかりません` };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return { success: false, error: '問題がありません' };
  }

  const headers = data[0];
  const usageCountCol = headers.indexOf('usage_count');

  // 問題データを取得
  let questions = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    questions.push({
      row_index: i + 1,  // シート上の行番号（1-indexed）
      question_id: row[0],
      question_text: row[1],
      choices: [row[2], row[3], row[4], row[5]],
      correct_index: row[6],
      hint: row[7] || '',
      usage_count: usageCountCol >= 0 ? (row[usageCountCol] || 0) : 0
    });
  }

  // usage_count でソートし、同一 usage_count 内はシャッフル
  questions = sortByUsageCountWithShuffle(questions);

  // 上位N問を選択
  const selected = questions.slice(0, count);

  // 選択した問題の usage_count を +1
  if (usageCountCol >= 0 && selected.length > 0) {
    selected.forEach(q => {
      const currentValue = sheet.getRange(q.row_index, usageCountCol + 1).getValue() || 0;
      sheet.getRange(q.row_index, usageCountCol + 1).setValue(currentValue + 1);
    });
  }

  // book_id から subject を抽出
  const match = book_id.match(/^(jp|math|sci|soc)_/);
  const subject = match ? match[1] : 'all';

  // row_index, usage_count を除去してクライアントに返す
  const result = selected.map(q => {
    const { row_index, usage_count, ...rest } = q;
    return {
      ...rest,
      book_id: book_id,
      subject: subject
    };
  });

  return {
    success: true,
    questions: result,
    time_limit: TIME_LIMITS[subject] || 180,
    book_id: book_id
  };
}
