# 参考書データ登録パイプライン 使用ガイド

## 概要

参考書PDFからクイズデータを生成し、SuperGeniusQuizシステムに登録するまでの一連のワークフローです。

```
参考書PDF
    ↓ Step 1: LLM（問題生成）
Markdownファイル（複数JSONブロック）
    ↓ Step 2: merge_json.py
単一JSONファイル
    ↓ Step 3: shuffle_json.py
シャッフル済みJSON
    ↓ Step 4: Python requests
create_book API → スプレッドシート登録
```

---

## 前提条件

- Python 3.x
- `requests` ライブラリ（`pip install requests`）
- LLMアクセス（Claude、Gemini等）

---

## Step 1: 問題データ生成（LLM）

### 入力
- 参考書PDF または テキスト

### 出力
- Markdownファイル（複数のJSONブロックを含む）

### 手順

1. LLMに参考書の内容を入力
2. `docs/問題生成プロンプト.md` のプロンプトを使用して問題を生成
3. 生成されたJSONブロックをMarkdownファイルとして保存

### JSONブロック形式

```json
{
  "action": "create_book",
  "subject": "jp",
  "title": "参考書タイトル",
  "questions": [
    {
      "question_text": "問題文",
      "choice_1": "選択肢1（正解）",
      "choice_2": "選択肢2",
      "choice_3": "選択肢3",
      "choice_4": "選択肢4",
      "correct_index": 1,
      "hint": "ヒント"
    }
  ]
}
```

### 教科コード

| コード | 教科 |
|--------|------|
| jp | 国語 |
| math | 算数 |
| sci | 理科 |
| soc | 社会 |

---

## Step 2: JSON結合（merge_json.py）

### 入力
- Markdownファイル（複数JSONブロック）

### 出力
- 単一JSONファイル（`{入力ファイル名}.json`）

### コマンド

```bash
cd data/
python3 merge_json.py "参考書名.md"
```

### 引数なしの場合

デフォルトで `中学入試にでる順 改訂第2版 四字熟語・ことわざ・慣用句.md` を処理します。

### 出力例

```
17 個のJSONブロックが見つかりました。結合を開始します...
  ブロック 1: 30 問を追加
  ブロック 2: 25 問を追加
  ...
--------------------------------------------------
完了しました。
出力ファイル: 参考書名.json
結合された問題数: 431
```

---

## Step 3: 選択肢シャッフル（shuffle_json.py）

### 目的

LLM生成データは「正解が常に選択肢1」になりがちなため、選択肢をランダムに並べ替えます。

### 入力
- 単一JSONファイル

### 出力
- シャッフル済みJSONファイル（`{入力ファイル名}_shuffled.json`）

### コマンド

```bash
cd data/
python3 shuffle_json.py "参考書名.json"
```

### 出力例

```
ファイルを読み込んでいます: 参考書名.json
全 431 問のシャッフルを開始します...
--------------------------------------------------
シャッフルが完了しました。
出力ファイル: 参考書名_shuffled.json
【シャッフル後の正解分布】
  選択肢 1: 119 問 (27.6%)
  選択肢 2: 110 問 (25.5%)
  選択肢 3: 105 問 (24.4%)
  選択肢 4: 97 問 (22.5%)
```

### 確認ポイント

- 各選択肢が約25%ずつになっていればOK
- 極端な偏り（例: 選択肢1が50%）がある場合は元データを確認

---

## Step 4: API登録

### 入力
- シャッフル済みJSONファイル

### 出力
- スプレッドシートに新規シート作成

### コマンド

```bash
cd data/
python3 -c "
import requests
import json

with open('参考書名_shuffled.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f'送信データ: {len(data[\"questions\"])} 問')

url = 'https://script.google.com/macros/s/AKfycbwzRzBLo0D32sn5lI9vgvDsc7vmJW4VZ9_m1kM_he5iGPWF-CJ6steCcCGOFoTnxK3D/exec'
response = requests.post(url, json=data)

print(f'レスポンス: {response.text}')
"
```

### 成功レスポンス

```json
{
  "success": true,
  "book_id": "jp_参考書タイトル",
  "question_count": 431,
  "message": "参考書「参考書タイトル」を作成しました"
}
```

### 注意事項

- **curlは使用不可**: GASのリダイレクトでPOSTデータが失われる
- **Python requestsを使用**: リダイレクトを正しく処理

---

## 一括実行スクリプト（参考）

全ステップを一括実行する場合：

```bash
cd data/

# Step 2: 結合
python3 merge_json.py "参考書名.md"

# Step 3: シャッフル
python3 shuffle_json.py "参考書名.json"

# Step 4: API送信
python3 -c "
import requests
import json

with open('参考書名_shuffled.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

url = 'https://script.google.com/macros/s/AKfycbwzRzBLo0D32sn5lI9vgvDsc7vmJW4VZ9_m1kM_he5iGPWF-CJ6steCcCGOFoTnxK3D/exec'
response = requests.post(url, json=data)
print(response.text)
"
```

---

## トラブルシューティング

### 「JSONブロックが見つかりません」

- Markdownファイル内の ` ```json ` と ` ``` ` の記法を確認
- 余分なスペースや改行がないか確認

### 「シートは既に存在します」

- 同名のシートが既にスプレッドシートに存在
- スプレッドシートから手動で削除してリトライ

### 「正解分布が偏っている」

- 元データの `correct_index` がすべて同じ値になっている可能性
- LLMでの問題生成時に正解位置を分散させるよう指示

### API送信でエラー

- インターネット接続を確認
- GAS APIがデプロイされているか確認
- JSONデータの形式が正しいか確認

---

## ファイル構成

```
data/
├── PIPELINE.md              # このファイル
├── merge_json.py            # JSON結合スクリプト
├── shuffle_json.py          # シャッフルスクリプト
├── 参考書名.md              # 入力（LLM生成）
├── 参考書名.json            # 中間出力（結合済み）
└── 参考書名_shuffled.json   # 最終出力（シャッフル済み）
```

---

**最終更新**: 2026-01-03 09:00
