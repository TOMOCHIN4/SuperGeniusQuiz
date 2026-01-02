# 既存データ移行ガイド

> 既存のv1-v3資産をv4で活用するための手順

---

## 概要

```
[既存システム]                    [v4]
QuestionDatabase (答え・ヒント)
        ↓ 一括変換
GeneratedQuestions形式     →     Questionsシート
        ↓
ジャンル構造 (40カテゴリ)   →     そのまま活用
```

---

## Step 1: 既存データのエクスポート

### 1.1 QuestionDatabaseからエクスポート

スプレッドシートID: `10JLP5ds2CNDOEYTxEzDyY82dErbD-InkTeuyzS_w_3U`

1. Google Sheetsを開く
2. QuestionDatabaseシートを選択
3. ファイル → ダウンロード → CSV

### 1.2 必要なカラム

```
answer_id, subject, category, answer, hint, difficulty
```

---

## Step 2: 問題文の一括生成

### 2.1 AIに依頼するプロンプト例

```
以下の「答え」と「ヒント」から、4択クイズの問題文と選択肢を作成してください。

【入力フォーマット】
- 答え: {answer}
- ヒント: {hint}
- カテゴリ: {category}

【出力フォーマット】
- 問題文:
- 選択肢A:
- 選択肢B:
- 選択肢C:
- 選択肢D:
- 正解: A/B/C/D

【ルール】
1. 問題文は小学生にわかりやすく
2. 選択肢は紛らわしすぎない適度な難易度
3. 正解以外の選択肢も学習に役立つ内容に
```

### 2.2 一括処理の方法

**オプションA: ChatGPTで手動**
- 10〜20問ずつコピペして生成
- 結果をスプレッドシートに貼り付け

**オプションB: スクリプトで自動化**
- OpenAI API or Gemini APIを使用
- バッチ処理で1,600問を生成
- 推定時間: 数時間（API制限次第）

**オプションC: 段階的に追加**
- 初期リリースは各カテゴリ10問ずつ（400問）
- 残りは後から追加

---

## Step 3: 新スプレッドシートへのインポート

### 3.1 新規スプレッドシート作成

1. Google Sheetsで新規作成
2. シート名: `Questions`
3. ヘッダー行を設定（DATA_SCHEMA.md参照）

### 3.2 データ貼り付け

1. 生成した問題をコピー
2. スプレッドシートに貼り付け
3. question_id を連番で付与

### 3.3 question_id の命名規則

```
{genre_id}_{連番3桁}

例:
JP01_001, JP01_002, ...
MA04_001, MA04_002, ...
```

---

## Step 4: 動作確認

### 4.1 データ整合性チェック

- [ ] 全問題に question_id がある
- [ ] subject と genre_id が一致している
- [ ] choices が4つある
- [ ] correct_index が 0-3 の範囲

### 4.2 サンプルクエリ

GASで以下が動作するか確認:

```javascript
// 国語の問題を10問ランダム取得
function getRandomQuestions(subject, count) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Questions');
  const data = sheet.getDataRange().getValues();
  const questions = data.filter(row => row[1] === subject);
  // シャッフルして count 件返す
}
```

---

## 既存ユーザーデータについて

### 移行する場合

1. Usersシートをエクスポート
2. 新スプレッドシートにインポート
3. password_hash はそのまま使える（bcrypt）

### 移行しない場合（リセット）

- 新規にユーザー登録してもらう
- 3人程度なら手間ではない

---

## タイムライン例

```
Day 1: 既存データエクスポート、スプレッドシート準備
Day 2-3: 問題文一括生成（優先カテゴリから）
Day 4: GAS基本実装
Day 5: フロントエンド実装
Day 6: テスト・調整
Day 7: リリース
```

---

## 注意点

1. **著作権**: 既存の問題素材の権利を確認
2. **品質チェック**: AI生成問題は誤りがないか確認
3. **バックアップ**: 作業前に既存シートをコピー
