# プロジェクト: SuperGeniusQuiz v1.1（参考書ベースシステム）

## ステータス概要（3行）
- 現在地: v1.1 参考書ベースシステム 本番稼働中 ✅
- 完成度: 問題生成→シャッフル→API登録パイプライン完成
- 次の課題: 追加コンテンツ登録

## バージョン履歴
| バージョン | 状態 | 内容 |
|-----------|------|------|
| v0.5 MVP | ✅ バックアップ済 | GAS + HTML/JS、3,095問（削除済み） |
| v1.0 本番 | ✅ 完了 | React + TypeScript + Vite + GAS API連携 |
| v1.1 参考書 | ✅ 稼働中 | 参考書ベース出題システム（完全移行） |

## 現在のシステム構成

### アーキテクチャ
```
[Vercel] ← React + TypeScript + Vite
    ↓ API通信
[GAS] ← Google Apps Script
    ↓ データアクセス
[Google Sheets] ← データベース
```

### スプレッドシート構成
| シート名 | 用途 |
|---------|------|
| Users | ユーザー管理（5名） |
| Answers | 回答履歴 |
| Sessions | セッション管理 |
| jp_テスト参考書 | テスト用参考書（5問） |
| jp_中学入試にでる順... | 四字熟語・ことわざ・慣用句（431問・シャッフル済） |
| jp_中学入試でる順ポケでる... | 漢字・熟語 書き取り（1,061問・シャッフル済） |

※ Questionsシート（3,095問）は削除済み

### 参考書システム仕様
- **シート命名規則**: `{教科コード}_{参考書名}`
- **教科コード**: jp(国語), math(算数), sci(理科), soc(社会)
- **自動認識**: シート追加で自動的にUIに反映
- **出題優先度**: usage_countが少ない問題から優先

### 参考書シート列構造
| 列 | 内容 |
|----|------|
| question_id | 問題番号（自動採番） |
| question_text | 問題文 |
| choice_1〜4 | 選択肢 |
| correct_index | 正解番号（0-3） |
| hint | ヒント |
| usage_count | 出題回数（自動更新） |

## 画面遷移フロー
```
Login → Dashboard（教科選択）
           ↓
    /books?subject=jp（参考書選択）
           ↓
    /quiz?book_id=jp_参考書名（クイズ）
           ↓
    Result（結果）→ History / Settings
```

## GAS API一覧

### 認証・ユーザー
| API | 機能 |
|-----|------|
| login | ログイン認証 |
| add_user | ユーザー追加 |
| get_stats | ユーザー統計取得 |

### 参考書システム
| API | 機能 |
|-----|------|
| create_book | 参考書シート作成 |
| get_books | 参考書一覧取得（user_id指定時は正答率付き） |
| get_book_questions | 問題取得（usage_count考慮） |

### クイズ
| API | 機能 |
|-----|------|
| submit_answers | 回答送信・保存 |

## 動作確認済み機能
- ✅ ログイン/ログアウト
- ✅ 教科選択 → 参考書選択
- ✅ クイズ出題（タイマー付き）
- ✅ 回答・正誤判定・結果表示
- ✅ 回答履歴保存
- ✅ 統計表示
- ✅ 使用頻度ベース出題（usage_count）
- ✅ 正答率表示（教科別・参考書別）

## 将来の拡張候補
- [ ] 復習モード（間違えた問題）
- [ ] 称号・バッジ機能
- [ ] 新着参考書通知
- [ ] UI/UX改善

## リソース

### 本番URL
| リソース | URL |
|---------|-----|
| **Vercel** | https://super-genius-quiz.vercel.app |
| **GAS API** | https://script.google.com/macros/s/AKfycbwzRzBLo0D32sn5lI9vgvDsc7vmJW4VZ9_m1kM_he5iGPWF-CJ6steCcCGOFoTnxK3D/exec |

### 開発リソース
| リソース | URL |
|---------|-----|
| GitHub | https://github.com/TOMOCHIN4/SuperGeniusQuiz |
| Vercel Dashboard | https://vercel.com/tomo2chin2s-projects |
| スプレッドシート | https://docs.google.com/spreadsheets/d/1BQpphBThc7AxFwaNhf5wGrj7Pj9adX4lZE4DKgI5XvM/edit |
| GASエディタ | https://script.google.com/u/0/home/projects/1i2DjCUpbXE9tLqH1_8_sJJKysblzAQHQqtELA_Bq2CkMOY5_9_sgKAi-/edit |

### ユーザー
| ユーザー名 | パスワード | 種別 |
|-----------|-----------|------|
| あおい | 17171717 | 本番 |
| ともひろ | 07214545 | 本番 |
| テスト太郎 | test123 | テスト |
| テスト花子 | test456 | テスト |
| テスト次郎 | test789 | テスト |

### 開発ツール
```
tools/
├── ask_gemini.py        # Gemini 外部意見者API
├── generate_questions.py # 問題生成スクリプト
└── requirements.txt     # 依存関係

data/
├── merge_json.py        # 複数JSONブロック結合スクリプト
├── shuffle_json.py      # 選択肢シャッフルスクリプト
└── *.md / *.json        # 参考書データ（生成済み問題）
```

### ドキュメント
```
CLAUDE.md                  # プロジェクト管理ガイド
STATUS.md                  # このファイル
log/LOG.md                 # 開発ログ
data/PIPELINE.md           # 参考書データ登録パイプライン使用ガイド
docs/参考書登録スキーマ.md    # 参考書登録API仕様
docs/問題生成プロンプト.md    # LLM用クイズ問題生成ガイド
```

### バックアップ
```
../SuperGeniusQuiz_v0.5_MVP_BACKUP/  # v0.5 MVPの完全バックアップ
```

---
**最終更新**: 2026-01-03 10:00
