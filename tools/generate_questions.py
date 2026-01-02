#!/usr/bin/env python3
"""
問題生成スクリプト

KNOWLEDGEディレクトリのJSONデータをGemini Flash APIで4択クイズ形式に変換する。

Usage:
    python tools/generate_questions.py KNOWLEDGE/jp/JP01.json
    python tools/generate_questions.py KNOWLEDGE/jp/JP01.json --mode max
    python tools/generate_questions.py --all --subject jp
    python tools/generate_questions.py --all

環境変数:
    GEMINI_API_KEY: Gemini API キー
"""

import os
import sys
import json
import csv
import re
import time
import argparse
from pathlib import Path
from typing import Optional


# プロジェクトルート
PROJECT_ROOT = Path(__file__).parent.parent

# KNOWLEDGEディレクトリ
KNOWLEDGE_DIR = PROJECT_ROOT / "KNOWLEDGE"

# システムインストラクションファイル
SYSTEM_INSTRUCTION_FILE = KNOWLEDGE_DIR / "SYSTEM＿INSTRUCTION.txt"

# 出力ディレクトリ
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / "data" / "generated"

# モデル
MODEL_ID = "models/gemini-3-flash-preview"

# ジャンル名マッピング
GENRE_NAMES = {
    # 国語
    "JP01": "漢字・語彙", "JP02": "文法・言葉のきまり", "JP03": "物語文読解",
    "JP04": "説明文・論説文読解", "JP05": "随筆文読解", "JP06": "詩・韻文",
    "JP07": "記述問題", "JP08": "知識・文学史",
    # 算数
    "MA01": "計算", "MA02": "数の性質", "MA03": "割合・比", "MA04": "速さ",
    "MA05": "文章題（その他）", "MA06": "平面図形", "MA07": "立体図形",
    "MA08": "場合の数・確率", "MA09": "グラフ・表", "MA10": "特殊算",
    # 理科
    "SC01": "力・運動", "SC02": "電気", "SC03": "光・音・熱", "SC04": "物質の性質",
    "SC05": "水溶液", "SC06": "燃焼・化学変化", "SC07": "植物", "SC08": "動物",
    "SC09": "人体", "SC10": "天体", "SC11": "気象", "SC12": "地学",
    # 社会
    "SO01": "日本地理（国土・自然）", "SO02": "日本地理（産業）", "SO03": "世界地理",
    "SO04": "歴史（古代〜平安）", "SO05": "歴史（鎌倉〜室町）", "SO06": "歴史（安土桃山〜江戸）",
    "SO07": "歴史（明治〜現代）", "SO08": "公民（政治・憲法）", "SO09": "公民（経済・国際）",
    "SO10": "時事問題",
}

# 教科コードマッピング
SUBJECT_MAP = {
    "JP": "jp", "MA": "math", "SC": "sci", "SO": "soc"
}


def load_env():
    """プロジェクトルートの.envファイルを読み込む"""
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if ": " in line:
                    key, value = line.split(": ", 1)
                elif "=" in line:
                    key, value = line.split("=", 1)
                else:
                    continue
                key = key.strip()
                value = value.strip()
                if key and value and key not in os.environ:
                    os.environ[key] = value


def load_system_instruction() -> str:
    """システムインストラクションを読み込む"""
    if not SYSTEM_INSTRUCTION_FILE.exists():
        raise FileNotFoundError(f"システムインストラクションが見つかりません: {SYSTEM_INSTRUCTION_FILE}")

    with open(SYSTEM_INSTRUCTION_FILE, "r", encoding="utf-8") as f:
        return f.read()


def load_json_file(file_path: Path) -> list[dict]:
    """JSONファイルを読み込む"""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_genre_id_from_filename(file_path: Path) -> str:
    """ファイル名からジャンルIDを取得"""
    return file_path.stem  # JP01.json -> JP01


def get_subject_from_genre_id(genre_id: str) -> str:
    """ジャンルIDから教科コードを取得"""
    prefix = genre_id[:2]  # JP01 -> JP
    return SUBJECT_MAP.get(prefix, "unknown")


def chunk_list(items: list, chunk_size: int) -> list[list]:
    """リストをチャンクに分割"""
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


def build_user_prompt(items: list[dict], mode: str, genre_id: str) -> str:
    """ユーザープロンプトを構築"""
    genre_name = GENRE_NAMES.get(genre_id, genre_id)
    subject = get_subject_from_genre_id(genre_id)

    if mode == "max":
        mode_instruction = """【最大化プラン】で問題を生成してください。
1つの知識データから複数の問題を作成し、多角的生成テクニック（正逆の転換、定義と名称の転換など）を駆使してください。"""
    else:
        mode_instruction = """【標準プラン】で問題を生成してください。
各知識データから1問ずつ、シンプルな問題を作成してください。"""

    prompt = f"""以下の知識データから4択クイズを生成してください。

## 指示
{mode_instruction}

## メタ情報
- subject: {subject}
- genre_id: {genre_id}
- genre_name: {genre_name}

## 品質要件（必須）
1. **選択肢の多様性**: 同じ知識から複数問作る場合でも、毎回異なるダミー選択肢を使うこと
2. **選択肢内の重複禁止**: 1つの問題内で同じ選択肢を2回以上使わない（例: ["A","B","B","C"] は禁止）
3. **選択肢は必ず4つ**: 3つ以下や5つ以上は禁止
4. **高品質なダミー**: 正解と同じカテゴリから選ぶ（漢字問題なら似た漢字、歴史なら同時代の人物など）

## 出力形式
- 確認は不要です。直接TSVを出力してください。
- ヘッダー行を含めてください。
- コードブロック（```tsv ... ```）で囲んでください。

## 知識データ（{len(items)}件）
```json
{json.dumps(items, ensure_ascii=False, indent=2)}
```
"""
    return prompt


def extract_tsv_from_response(response_text: str) -> str:
    """レスポンスからTSVを抽出"""
    # ```tsv または ``` ブロックを探す
    match = re.search(r'```(?:tsv)?\n(.+?)```', response_text, re.DOTALL)
    if match:
        return match.group(1).strip()

    # コードブロックがない場合、タブを含む行を探す
    lines = []
    for line in response_text.split('\n'):
        if '\t' in line:
            lines.append(line)

    if lines:
        return '\n'.join(lines)

    # それでもなければ全体を返す
    return response_text.strip()


def validate_tsv_row(row: dict) -> tuple[bool, str]:
    """TSV行をバリデーション"""
    required = ["subject", "genre_id", "genre_name", "question_text",
                "choices", "correct_index", "correct_answer"]

    for field in required:
        if field not in row or not row[field]:
            return False, f"Missing field: {field}"

    # choices のバリデーション
    try:
        choices = json.loads(row["choices"])
        if not isinstance(choices, list):
            return False, "choices must be array"
        if len(choices) != 4:
            return False, f"choices must have exactly 4 items, got {len(choices)}"
        # 選択肢内の重複チェック
        if len(set(choices)) != len(choices):
            return False, f"choices has duplicates: {choices}"
    except json.JSONDecodeError:
        return False, "choices is not valid JSON"

    # correct_index のバリデーション
    try:
        idx = int(row["correct_index"])
        if idx < 0 or idx >= len(choices):
            return False, f"correct_index {idx} out of range"
    except ValueError:
        return False, "correct_index is not a number"

    return True, ""


def parse_tsv(tsv_text: str) -> list[dict]:
    """TSVテキストをパースしてバリデーション"""
    lines = tsv_text.strip().split('\n')
    if not lines:
        return []

    # ヘッダー行を取得
    header = lines[0].split('\t')

    questions = []
    errors = []

    for i, line in enumerate(lines[1:], start=2):
        if not line.strip():
            continue

        fields = line.split('\t')
        if len(fields) < len(header):
            # 足りないフィールドを空文字で埋める
            fields.extend([''] * (len(header) - len(fields)))

        row = dict(zip(header, fields))

        is_valid, error = validate_tsv_row(row)
        if is_valid:
            questions.append(row)
        else:
            errors.append(f"行{i}: {error}")

    if errors:
        print(f"  警告: {len(errors)}行でエラー")
        for err in errors[:5]:  # 最初の5件だけ表示
            print(f"    - {err}")
        if len(errors) > 5:
            print(f"    - ... 他{len(errors)-5}件")

    return questions


def call_gemini_api(system_instruction: str, user_prompt: str) -> str:
    """Gemini APIを呼び出す"""
    from google import genai
    from google.genai import types

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("環境変数 GEMINI_API_KEY が設定されていません")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=user_prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=65536,
        )
    )

    return response.text


def write_tsv(questions: list[dict], output_file: Path, append: bool = False):
    """TSVファイルに書き込む"""
    fieldnames = ["subject", "genre_id", "genre_name", "question_text",
                  "choices", "correct_index", "correct_answer", "hint", "difficulty"]

    mode = 'a' if append else 'w'
    write_header = not append or not output_file.exists() or output_file.stat().st_size == 0

    with open(output_file, mode, encoding="utf-8", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter='\t', extrasaction='ignore')
        if write_header:
            writer.writeheader()
        writer.writerows(questions)


def process_file(
    file_path: Path,
    system_instruction: str,
    mode: str,
    output_dir: Path,
    chunk_size: int,
    dry_run: bool
) -> int:
    """1つのJSONファイルを処理"""
    genre_id = get_genre_id_from_filename(file_path)
    print(f"\n処理中: {file_path.name} ({genre_id})")

    # JSON読み込み
    items = load_json_file(file_path)
    print(f"  データ数: {len(items)}件")

    # 出力ファイル
    output_file = output_dir / f"{genre_id}.tsv"

    # チャンク分割
    chunks = chunk_list(items, chunk_size)
    print(f"  チャンク数: {len(chunks)} ({chunk_size}件/チャンク)")

    total_questions = 0

    for i, chunk in enumerate(chunks, start=1):
        print(f"  チャンク {i}/{len(chunks)} 処理中...")

        # プロンプト構築
        user_prompt = build_user_prompt(chunk, mode, genre_id)

        if dry_run:
            print(f"    [ドライラン] プロンプト長: {len(user_prompt)}文字")
            continue

        # API呼び出し
        try:
            response_text = call_gemini_api(system_instruction, user_prompt)
        except Exception as e:
            print(f"    エラー: {e}")
            continue

        # TSV抽出
        tsv_text = extract_tsv_from_response(response_text)

        # パース・バリデーション
        questions = parse_tsv(tsv_text)
        print(f"    生成数: {len(questions)}問")

        # 書き込み
        if questions:
            write_tsv(questions, output_file, append=(i > 1))
            total_questions += len(questions)

        # レート制限対策
        if i < len(chunks):
            time.sleep(1)

    if not dry_run:
        print(f"  完了: {total_questions}問 → {output_file}")

    return total_questions


def get_all_json_files(subject: Optional[str] = None) -> list[Path]:
    """全JSONファイルを取得"""
    files = []

    subject_dirs = {
        "jp": KNOWLEDGE_DIR / "jp",
        "math": KNOWLEDGE_DIR / "math",
        "sci": KNOWLEDGE_DIR / "sci",
        "soc": KNOWLEDGE_DIR / "soc",
    }

    if subject:
        dirs = [subject_dirs.get(subject)]
        if dirs[0] is None:
            raise ValueError(f"Unknown subject: {subject}")
    else:
        dirs = list(subject_dirs.values())

    for d in dirs:
        if d and d.exists():
            files.extend(sorted(d.glob("*.json")))

    return files


def main():
    parser = argparse.ArgumentParser(description="KNOWLEDGEデータから問題を生成")
    parser.add_argument("file", type=Path, nargs="?", help="処理するJSONファイル")
    parser.add_argument("--mode", choices=["standard", "max"], default="max",
                        help="生成モード (default: max)")
    parser.add_argument("--all", action="store_true", help="全ファイル処理")
    parser.add_argument("--subject", choices=["jp", "math", "sci", "soc"],
                        help="対象教科（--allと併用）")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR,
                        help=f"出力ディレクトリ (default: {DEFAULT_OUTPUT_DIR})")
    parser.add_argument("--chunk-size", type=int, default=20,
                        help="1回のAPI呼び出しに含めるアイテム数 (default: 20)")
    parser.add_argument("--dry-run", action="store_true",
                        help="API呼び出しせずプロンプト確認")

    args = parser.parse_args()

    # 環境変数読み込み
    load_env()

    # 処理対象ファイル
    if args.all:
        files = get_all_json_files(args.subject)
    elif args.file:
        files = [args.file]
    else:
        parser.print_help()
        sys.exit(1)

    if not files:
        print("処理対象ファイルがありません")
        sys.exit(1)

    print(f"処理対象: {len(files)}ファイル")
    print(f"モード: {args.mode}")
    print(f"出力先: {args.output_dir}")

    # 出力ディレクトリ作成
    args.output_dir.mkdir(parents=True, exist_ok=True)

    # システムインストラクション読み込み
    system_instruction = load_system_instruction()
    print(f"システムインストラクション: {len(system_instruction)}文字")

    # 処理実行
    total = 0
    for file_path in files:
        count = process_file(
            file_path,
            system_instruction,
            args.mode,
            args.output_dir,
            args.chunk_size,
            args.dry_run
        )
        total += count

    print(f"\n=== 完了 ===")
    print(f"総生成数: {total}問")
    if not args.dry_run:
        print(f"出力先: {args.output_dir}")


if __name__ == "__main__":
    main()
