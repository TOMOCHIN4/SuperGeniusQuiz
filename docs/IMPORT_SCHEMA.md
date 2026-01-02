# 問題インポート スキーマ仕様

> 追加コンテンツ（問題データ）をインポートする際のフォーマット定義

---

## 対応フォーマット

| 形式 | 拡張子 | 用途 |
|------|--------|------|
| TSV | `.tsv` | Excel/スプレッドシートからのコピペ向け |
| JSON | `.json` | プログラム生成向け |

---

## フィールド定義

### 必須フィールド（7項目）

| フィールド | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `subject` | string | 教科コード | `jp`, `math`, `sci`, `soc` |
| `genre_id` | string | ジャンルID | `JP01`, `MA04`, `SC07` |
| `genre_name` | string | ジャンル名 | `漢字・語彙`, `速さ` |
| `question_text` | string | 問題文 | `「収穫」の読み方は？` |
| `choices` | array/string | 選択肢（4つ推奨） | `["A", "B", "C", "D"]` |
| `correct_index` | number | 正解のインデックス（0始まり） | `0`, `1`, `2`, `3` |
| `correct_answer` | string | 正解テキスト | `しゅうかく` |

### オプションフィールド（3項目）

| フィールド | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `question_id` | string | 問題ID（省略時は自動採番） | `JP01_046` |
| `hint` | string | ヒント・解説 | `「収」は「しゅう」と読みます` |
| `difficulty` | string | 難易度 | `easy`, `normal`, `hard` |

### 自動付与フィールド（インポート時に自動設定）

| フィールド | 説明 |
|-----------|------|
| `question_id` | 省略または重複時に自動採番（`{genre_id}_{連番3桁}`） |
| `created_at` | インポート日時 |
| `updated_at` | インポート日時 |
| `import_batch_id` | バッチID（`batch_YYYYMMDD_HHMM`） |
| `usage_count` | 出題回数（初期値: 0） |

---

## question_id の自動採番

**question_id は省略可能です。** インポート時に以下のルールで自動採番されます：

1. `question_id` が空欄 → 自動採番
2. `question_id` が既存IDと重複 → 自動採番（上書きしない）
3. `question_id` が一意 → そのまま使用

**採番ルール:**
```
{genre_id}_{連番3桁}

例: SO10の既存最大が003 → 次は SO10_004
```

---

## 教科コード・ジャンルID 一覧

### 国語（jp）: 8ジャンル

| genre_id | genre_name |
|----------|------------|
| JP01 | 漢字・語彙 |
| JP02 | 文法・言葉のきまり |
| JP03 | 物語文読解 |
| JP04 | 説明文・論説文読解 |
| JP05 | 随筆文読解 |
| JP06 | 詩・韻文 |
| JP07 | 記述問題 |
| JP08 | 知識・文学史 |

### 算数（math）: 10ジャンル

| genre_id | genre_name |
|----------|------------|
| MA01 | 計算 |
| MA02 | 数の性質 |
| MA03 | 割合・比 |
| MA04 | 速さ |
| MA05 | 文章題（その他） |
| MA06 | 平面図形 |
| MA07 | 立体図形 |
| MA08 | 場合の数・確率 |
| MA09 | グラフ・表 |
| MA10 | 特殊算 |

### 理科（sci）: 12ジャンル

| genre_id | genre_name |
|----------|------------|
| SC01 | 力・運動 |
| SC02 | 電気 |
| SC03 | 光・音・熱 |
| SC04 | 物質の性質 |
| SC05 | 水溶液 |
| SC06 | 燃焼・化学変化 |
| SC07 | 植物 |
| SC08 | 動物 |
| SC09 | 人体 |
| SC10 | 天体 |
| SC11 | 気象 |
| SC12 | 地学 |

### 社会（soc）: 10ジャンル

| genre_id | genre_name |
|----------|------------|
| SO01 | 日本地理（国土・自然） |
| SO02 | 日本地理（産業） |
| SO03 | 世界地理 |
| SO04 | 歴史（古代〜平安） |
| SO05 | 歴史（鎌倉〜室町） |
| SO06 | 歴史（安土桃山〜江戸） |
| SO07 | 歴史（明治〜現代） |
| SO08 | 公民（政治・憲法） |
| SO09 | 公民（経済・国際） |
| SO10 | 時事問題 |

---

## TSV形式

### ヘッダー行（必須）

```
subject	genre_id	genre_name	question_text	choices	correct_index	correct_answer	hint	difficulty
```

### データ行の例

```
soc	SO10	時事問題	2025年10月に就任した、日本憲政史上初となる女性の内閣総理大臣は誰ですか？	["小池百合子", "高市早苗", "上川陽子", "野田聖子"]	1	高市早苗	第104代内閣総理大臣に就任しました。	easy
soc	SO10	時事問題	高市早苗首相が就任した際、自民党が連立政権を組むことになったパートナーの政党はどこですか？	["公明党", "国民民主党", "日本維新の会", "立憲民主党"]	2	日本維新の会	長年続いた公明党との連立が解消され、日本維新の会と連立しました。	normal
```

### choices の記法

TSVでは以下のいずれかで記述可能：

```
# JSON配列形式（推奨）
["選択肢A", "選択肢B", "選択肢C", "選択肢D"]

# カンマ区切り形式（シンプル）
選択肢A, 選択肢B, 選択肢C, 選択肢D
```

---

## JSON形式

```json
[
  {
    "subject": "soc",
    "genre_id": "SO10",
    "genre_name": "時事問題",
    "question_text": "2025年10月に就任した、日本憲政史上初となる女性の内閣総理大臣は誰ですか？",
    "choices": ["小池百合子", "高市早苗", "上川陽子", "野田聖子"],
    "correct_index": 1,
    "correct_answer": "高市早苗",
    "hint": "第104代内閣総理大臣に就任しました。",
    "difficulty": "easy"
  },
  {
    "subject": "soc",
    "genre_id": "SO10",
    "genre_name": "時事問題",
    "question_text": "高市早苗首相が就任した際、自民党が連立政権を組むことになったパートナーの政党はどこですか？",
    "choices": ["公明党", "国民民主党", "日本維新の会", "立憲民主党"],
    "correct_index": 2,
    "correct_answer": "日本維新の会",
    "hint": "長年続いた公明党との連立が解消され、日本維新の会と連立しました。",
    "difficulty": "normal"
  }
]
```

---

## インポート手順

### 1. ファイル準備

```bash
# 配置先
data/new_questions.tsv
# または
data/new_questions.json
```

### 2. バリデーション（ドライラン）

```bash
python tools/import_questions.py data/new_questions.tsv --dry-run
```

出力例：
```
TSVファイルを読み込み中: data/new_questions.tsv
読み込んだ問題数: 3
バリデーション: OK

教科別内訳:
  soc: 3問

[ドライラン] 実際の送信はスキップしました
```

### 3. 本番インポート

```bash
python tools/import_questions.py data/new_questions.tsv
```

出力例：
```
✅ 成功: 3問をインポートしました
   バッチID: batch_20251229_2330
   インポート数: 3問
   生成されたID:
     - SO10_001
     - SO10_002
     - SO10_003
```

---

## バリデーションルール

インポート時に以下をチェック：

| チェック項目 | エラー時の動作 |
|-------------|---------------|
| 必須フィールド欠落 | エラー停止 |
| choices が2つ未満 | エラー停止 |
| correct_index が範囲外 | エラー停止 |
| question_id 重複 | 自動採番で新IDを付与 |

---

## Gemini/ChatGPT での生成プロンプト例

```
以下の形式で小学生向けクイズ問題を10問生成してください。

教科: 社会（subject: soc）
ジャンル: 時事問題（genre_id: SO10, genre_name: 時事問題）
難易度: normal

出力形式（JSON）:
[
  {
    "subject": "soc",
    "genre_id": "SO10",
    "genre_name": "時事問題",
    "question_text": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "correct_index": 0,
    "correct_answer": "正解テキスト",
    "hint": "解説",
    "difficulty": "normal"
  }
]

注意:
- 選択肢は4つ
- correct_index は 0〜3 の整数
- correct_answer は choices[correct_index] と一致させる
- 小学4〜6年生が解ける難易度
- question_id は不要（自動採番されます）
```

---

## 関連ファイル

| ファイル | 説明 |
|----------|------|
| `tools/import_questions.py` | インポートスクリプト |
| `v4_concept/DATA_SCHEMA.md` | 全シートのスキーマ定義 |
| `v4_concept/question_allocation.md` | ジャンル別目標問題数 |
| `data/questions_40.tsv` | 既存の問題データ例 |

---

**最終更新**: 2025-12-29
