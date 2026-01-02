# 超天才クイズ v1.0 - 本番リリース開発計画

**最終更新**: 2026-01-01 22:00
**バージョン**: v1.0（本番リリース版）

---

## 概要

GAS + HTML/JS によるMVP（v0.5）から、React + TypeScript + Vite によるモダンフロントエンドへ移行し、本番リリースを目指す。

### 移行の目的
1. UI設計書（DEVEROPMENT.md）に基づく高品質なUI実現
2. コンポーネント指向による保守性・拡張性の向上
3. TypeScriptによる型安全性の確保
4. 将来の機能拡張（Phase 3, 4）への対応

---

## 技術スタック（確定）

| カテゴリ | 技術 | バージョン | 選定理由 |
|---------|------|-----------|---------|
| フレームワーク | React | v19+ | コンポーネント指向、エコシステム |
| 言語 | TypeScript | v5+ | 型安全性 |
| ビルドツール | Vite | v6+ | 高速ビルド、優れたDX |
| スタイリング | SCSS Modules | - | クラス名衝突防止、モジュール化 |
| グラフ | Chart.js + react-chartjs-2 | - | 設計書指定、軽量 |
| デプロイ | Vercel | - | Git連携、自動デプロイ |
| バックエンド | 既存GAS（API化） | - | 移行コスト最小化 |

---

## フェーズ構成

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | プロジェクト初期化・基盤構築 | ✅ 完了 |
| Phase 2 | UIコンポーネント実装 | 🔄 進行中 |
| Phase 3 | 機能実装（認証・クイズ・結果） | 🔲 待機 |
| Phase 4 | GAS API連携・データ統合 | 🔲 待機 |
| Phase 5 | デプロイ・本番移行 | 🔲 待機 |

---

## Phase 1: プロジェクト初期化・基盤構築

### 目的
React + TypeScript + Vite プロジェクトの初期化と、デザインシステムの基盤構築

### 最小スコープ
- [x] 1.1 Vite + React + TypeScript プロジェクト作成 ✅
- [x] 1.2 ディレクトリ構造の構築 ✅
- [x] 1.3 SCSS環境セットアップ ✅
- [x] 1.4 デザイントークン定義（_variables.scss）✅
- [x] 1.5 型定義ファイル作成（types/index.ts）✅
- [x] 1.6 基本的なApp.tsxとルーティング設定 ✅

### ディレクトリ構造
```
frontend/
├── src/
│   ├── assets/             # 画像、アイコン
│   ├── components/         # 汎用UIコンポーネント
│   │   ├── ui/             # Button, Card, Input等
│   │   ├── charts/         # グラフコンポーネント
│   │   └── layout/         # Header, Footer, Layout
│   ├── features/           # 機能単位コンポーネント
│   │   ├── auth/           # ログイン関連
│   │   ├── dashboard/      # ダッシュボード
│   │   ├── quiz/           # クイズ実行
│   │   └── result/         # 結果表示
│   ├── hooks/              # カスタムフック
│   ├── services/           # API通信
│   ├── stores/             # 状態管理
│   ├── styles/             # グローバルスタイル
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── global.scss
│   ├── types/              # 型定義
│   ├── utils/              # ユーティリティ
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 受入基準
- `npm run dev` で開発サーバーが起動する
- TypeScript の型チェックがパスする
- SCSS Modules が正しく動作する
- デザイントークンが定義されている

---

## Phase 2: UIコンポーネント実装

### 目的
UI設計書（DEVEROPMENT.md）に基づく再利用可能なコンポーネント群の構築

### 準備作業 ✅ 完了
- [x] clsx + cn()ユーティリティ導入
- [x] SCSS自動インポート設定（v.$, m.@include）
- [x] camelCaseクラス名設定
- [x] 実装順序決定（Atomic Design: Atoms→Molecules→Organisms）

### 最小スコープ

#### 2.1 汎用UIコンポーネント（Atoms）
- [ ] Button コンポーネント（プライマリ/セカンダリ/ゴースト）
- [ ] Card コンポーネント（インタラクティブ対応）
- [ ] Input コンポーネント
- [ ] ProgressBar コンポーネント
- [ ] Loading コンポーネント

#### 2.2 レイアウトコンポーネント（Organisms）
- [x] Layout（共通レイアウト）✅ Phase 1で作成済み
- [ ] Header（ロゴ、ユーザーアイコン）改良
- [ ] Footer（ナビゲーション）改良

#### 2.3 グラフコンポーネント（Molecules）
- [ ] BarChart（学習時間グラフ）
- [ ] DoughnutChart（正答率表示）

#### 2.4 機能コンポーネント（Molecules）
- [ ] SubjectCard（教科選択カード）
- [ ] HeroMessage（キャッチコピー表示）
- [ ] QuizQuestion（問題表示）
- [ ] AnswerOption（選択肢）
- [ ] ResultSummary（結果サマリー）

### カラーパレット（設計書4.1準拠）
```scss
// Base Colors
$bg-white: #F5F7FA;
$card-white: #FFFFFF;
$text-primary: #333333;
$text-secondary: #666666;
$brand-blue: #007AFF;

// Subject Colors
$subject-jp: #4A90E2;    // 国語
$subject-math: #50C878;  // 算数
$subject-sci: #00A896;   // 理科
$subject-soc: #FF6B6B;   // 社会
```

### 受入基準
- 全コンポーネントがStorybookまたはデモページで確認可能
- レスポンシブ対応（モバイル/タブレット/PC）
- 設計書のカラーパレット・タイポグラフィに準拠

---

## Phase 3: 機能実装

### 目的
各画面の機能実装とユーザーフローの構築

### 最小スコープ

#### 3.1 認証機能
- [ ] ログイン画面
- [ ] ログイン状態管理（Context/Store）
- [ ] ログアウト機能
- [ ] 認証ガード（未ログイン時リダイレクト）

#### 3.2 ダッシュボード
- [ ] ダッシュボード画面（設計書準拠）
- [ ] 学習メトリクス表示（グラフ）
- [ ] 教科選択グリッド
- [ ] 新着問題通知

#### 3.3 クイズ機能
- [ ] 教科・ジャンル選択画面
- [ ] クイズ出題画面（タイマー付き）
- [ ] 回答選択・送信
- [ ] 正誤判定・即時フィードバック

#### 3.4 結果表示
- [ ] 結果画面（スコア、星評価）
- [ ] 詳細結果リスト
- [ ] 次のアクション（ダッシュボードへ戻る/次のチャプター）

### 受入基準
- 全画面遷移がスムーズに動作
- タイマーが正確に動作
- エラー時に適切なフィードバック表示

---

## Phase 4: GAS API連携・データ統合

### 目的
既存GASバックエンドとの接続、データの取得・送信

### 最小スコープ
- [ ] 4.1 GAS API仕様の確認・ドキュメント化
- [ ] 4.2 APIサービス層の実装（fetch wrapper）
- [ ] 4.3 認証API連携（login）
- [ ] 4.4 問題データ取得API連携（get_questions）
- [ ] 4.5 回答送信API連携（submit_answer）
- [ ] 4.6 統計データ取得API連携
- [ ] 4.7 エラーハンドリング・リトライ処理

### GAS API エンドポイント（既存）
| アクション | 説明 |
|-----------|------|
| login | ユーザー認証 |
| get_questions | 問題データ取得 |
| submit_answer | 回答送信 |
| get_user_stats | ユーザー統計取得 |
| get_recent_imports | 新着問題取得 |

### 受入基準
- 全APIエンドポイントと正常に通信可能
- ネットワークエラー時に適切なリトライ/フォールバック
- ローディング状態の表示

---

## Phase 5: デプロイ・本番移行

### 目的
Vercelへのデプロイと本番環境の構築

### 最小スコープ
- [ ] 5.1 Vercelプロジェクト作成
- [ ] 5.2 環境変数設定（GAS API URL等）
- [ ] 5.3 ビルド・デプロイ設定
- [ ] 5.4 カスタムドメイン設定（オプション）
- [ ] 5.5 本番環境テスト
- [ ] 5.6 既存ユーザーへの案内

### 受入基準
- Vercel上で正常に動作
- Lighthouse スコア 90以上
- 初回読み込み 3秒以内
- 既存GASバックエンドと正常通信

---

## 主要リスクと対策

| リスク | 発生確度 | 対策（Plan B） |
|--------|---------|---------------|
| GAS API のレスポンス遅延 | 中 | キャッシュ層追加、ローディングUI最適化 |
| CORS問題 | 高 | GAS側でCORSヘッダー設定、またはプロキシ使用 |
| 既存データとの互換性 | 低 | 型定義で厳密にチェック、マイグレーション処理 |
| React 19 の不安定性 | 低 | React 18 にダウングレード可能な設計 |

---

## 完了済みフェーズ（v0.5 MVP）

### Phase 0: MVP開発 ✅
- GAS + Sheets + HTML/JS によるクイズアプリ基盤
- ログイン/ログアウト機能
- 教科・ジャンル選択
- クイズ出題（タイマー付き）
- 結果表示・履歴保存
- 問題インポート機能
- 3,095問の問題データ
- 本番ユーザー2名作成

**バックアップ**: `SuperGeniusQuiz_v0.5_MVP_BACKUP/`

---

## 将来構想（v1.1以降）

### 復習モード
- 間違えた問題の記録・再出題
- 弱点ジャンルの自動判定

### 称号・バッジ機能
- 達成条件の定義
- バッジUIデザイン

### ランキング機能
- 週間/月間ランキング
- 教科別ランキング

### 学習分析
- 学習時間の記録
- 正答率の推移グラフ
- 保護者向けレポート

---

## 参照ドキュメント

| ファイル | 内容 |
|---------|------|
| [STATUS.md](./STATUS.md) | 現在の状態・完成度 |
| [log/LOG.md](./log/LOG.md) | 開発履歴 |
| [docs/DEVEROPMENT.md](./docs/DEVEROPMENT.md) | UI設計書 v5.0 |
| [docs/MOCKUP_SAMPLE/](./docs/MOCKUP_SAMPLE/) | UIモックアップ |
| [docs/IMPORT_SCHEMA.md](./docs/IMPORT_SCHEMA.md) | データスキーマ仕様 |

---

## 次のアクション

**Phase 1.1: Vite + React + TypeScript プロジェクト作成**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install sass
npm install chart.js react-chartjs-2
npm install react-router-dom
```
