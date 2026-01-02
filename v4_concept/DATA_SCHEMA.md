# データ構造定義

> v4で使用するスプレッドシートのスキーマ

---

## 問題集シート（Questions）

v4では問題文・選択肢を事前に格納。LLM呼び出し不要。

### カラム定義

| カラム | 型 | 必須 | 説明 |
|--------|-----|------|------|
| question_id | string | ○ | 一意のID（例: JP01_001） |
| subject | string | ○ | 教科コード（jp/math/sci/soc） |
| genre_id | string | ○ | ジャンルID（例: JP01, MA04） |
| genre_name | string | ○ | ジャンル名（例: 漢字・語彙） |
| question_text | string | ○ | 問題文 |
| choices | string | ○ | 選択肢（JSON配列 or カンマ区切り） |
| correct_index | number | ○ | 正解のインデックス（0-3） |
| correct_answer | string | ○ | 正解テキスト |
| hint | string | | ヒント（解説用） |
| difficulty | string | | 難易度（easy/normal/hard） |
| created_at | string | | 作成日時 |
| updated_at | string | | 更新日時 |

### サンプルデータ

```
question_id: JP01_001
subject: jp
genre_id: JP01
genre_name: 漢字・語彙
question_text: 「収穫」の読み方として正しいものはどれですか？
choices: ["しゅうかく", "しゅかく", "すうかく", "しゅうがく"]
correct_index: 0
correct_answer: しゅうかく
hint: 「収」は「しゅう」、「穫」は「かく」と読みます
difficulty: normal
```

---

## ユーザーシート（Users）

### カラム定義

| カラム | 型 | 必須 | 説明 |
|--------|-----|------|------|
| user_id | string | ○ | 一意のID |
| username | string | ○ | ユーザー名（表示用） |
| password_hash | string | ○ | パスワードハッシュ |
| created_at | string | ○ | 登録日時 |
| last_login | string | | 最終ログイン |

---

## 回答履歴シート（Answers）

### カラム定義

| カラム | 型 | 必須 | 説明 |
|--------|-----|------|------|
| answer_id | string | ○ | 一意のID |
| user_id | string | ○ | ユーザーID |
| session_id | string | ○ | セッションID |
| question_id | string | ○ | 問題ID |
| subject | string | ○ | 教科 |
| genre_id | string | ○ | ジャンルID |
| user_answer | number | ○ | ユーザーの回答（インデックス） |
| is_correct | boolean | ○ | 正解かどうか |
| time_taken | number | | 回答にかかった秒数 |
| answered_at | string | ○ | 回答日時 |

---

## セッションシート（Sessions）

### カラム定義

| カラム | 型 | 必須 | 説明 |
|--------|-----|------|------|
| session_id | string | ○ | 一意のID |
| user_id | string | ○ | ユーザーID |
| subject | string | ○ | 教科（allの場合は全教科） |
| genre_id | string | | ジャンルID（指定時） |
| total_questions | number | ○ | 出題数 |
| correct_count | number | ○ | 正答数 |
| time_limit | number | ○ | 制限時間（秒） |
| time_remaining | number | | 残り時間（秒） |
| started_at | string | ○ | 開始日時 |
| finished_at | string | | 終了日時 |

---

## ジャンルマスタ（参照用）

`question_allocation.md` を参照

| 教科 | コード | カテゴリ数 |
|------|--------|-----------|
| 国語 | jp | 8 (JP01-JP08) |
| 算数 | math | 10 (MA01-MA10) |
| 理科 | sci | 12 (SC01-SC12) |
| 社会 | soc | 10 (SO01-SO10) |
