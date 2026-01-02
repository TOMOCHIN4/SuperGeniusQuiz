#!/usr/bin/env python3
"""
問題データインポートスクリプト

TSV または JSON ファイルを読み込み、GAS Web App に POST してスプレッドシートに投入する。

使用方法:
    python tools/import_questions.py data/new_questions.tsv
    python tools/import_questions.py data/new_questions.json
    python tools/import_questions.py data/new_questions.tsv --batch-id batch_20251229_1500
"""

import sys
import json
import csv
import argparse
from pathlib import Path
from datetime import datetime
from urllib import request, error

# GAS Web App URL
GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwlfAC4Zu1bPyXbu6hHpyNoOSZg4oaTpuIQF_qB_dqkJmdtnt72zzklIWQiYCmC12Tg/exec"

# 必須フィールド（question_idは自動採番のためオプション）
REQUIRED_FIELDS = [
    "subject",
    "genre_id",
    "genre_name",
    "question_text",
    "choices",
    "correct_index",
    "correct_answer"
]

# オプションフィールド
OPTIONAL_FIELDS = [
    "question_id",  # 省略時はGAS側で自動採番
    "hint",
    "difficulty"
]


def load_tsv(file_path: Path) -> list[dict]:
    """TSVファイルを読み込む"""
    questions = []
    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            q = {}
            for field in REQUIRED_FIELDS + OPTIONAL_FIELDS:
                if field in row:
                    value = row[field]
                    # choices は JSON としてパース
                    if field == "choices":
                        try:
                            q[field] = json.loads(value)
                        except json.JSONDecodeError:
                            # カンマ区切りとして処理
                            q[field] = [s.strip() for s in value.split(",")]
                    # correct_index は整数
                    elif field == "correct_index":
                        q[field] = int(value)
                    else:
                        q[field] = value
            questions.append(q)
    return questions


def load_json(file_path: Path) -> list[dict]:
    """JSONファイルを読み込む"""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 配列でない場合はエラー
    if not isinstance(data, list):
        raise ValueError("JSONファイルは問題オブジェクトの配列である必要があります")

    return data


def validate_questions(questions: list[dict]) -> list[str]:
    """問題データをバリデーション"""
    errors = []
    for i, q in enumerate(questions):
        for field in REQUIRED_FIELDS:
            if field not in q or q[field] is None or q[field] == "":
                errors.append(f"問題 {i+1}: {field} がありません")

        # choices のバリデーション
        if "choices" in q:
            if not isinstance(q["choices"], list):
                errors.append(f"問題 {i+1}: choices は配列である必要があります")
            elif len(q["choices"]) < 2:
                errors.append(f"問題 {i+1}: choices は2つ以上必要です")

        # correct_index のバリデーション
        if "correct_index" in q and "choices" in q:
            if isinstance(q["choices"], list):
                if q["correct_index"] < 0 or q["correct_index"] >= len(q["choices"]):
                    errors.append(f"問題 {i+1}: correct_index が範囲外です")

    return errors


def import_to_gas(questions: list[dict], batch_id: str = None) -> dict:
    """GAS Web App に問題を POST"""
    payload = {
        "action": "import_questions",
        "questions": questions
    }

    if batch_id:
        payload["batch_id"] = batch_id

    data = json.dumps(payload).encode("utf-8")

    req = request.Request(
        GAS_WEB_APP_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with request.urlopen(req, timeout=300) as response:
            result = json.loads(response.read().decode("utf-8"))
            return result
    except error.HTTPError as e:
        return {"success": False, "error": f"HTTP Error: {e.code} {e.reason}"}
    except error.URLError as e:
        return {"success": False, "error": f"URL Error: {e.reason}"}
    except json.JSONDecodeError:
        return {"success": False, "error": "レスポンスのパースに失敗しました"}


def generate_batch_id() -> str:
    """バッチIDを生成"""
    now = datetime.now()
    return f"batch_{now.strftime('%Y%m%d_%H%M')}"


def main():
    parser = argparse.ArgumentParser(description="問題データをGAS経由でスプレッドシートにインポート")
    parser.add_argument("file", type=Path, help="インポートするファイル（TSV または JSON）")
    parser.add_argument("--batch-id", type=str, help="バッチID（省略時は自動生成）")
    parser.add_argument("--dry-run", action="store_true", help="実際には送信せず、バリデーションのみ行う")

    args = parser.parse_args()

    # ファイル存在確認
    if not args.file.exists():
        print(f"エラー: ファイルが見つかりません: {args.file}")
        sys.exit(1)

    # ファイル形式判定と読み込み
    suffix = args.file.suffix.lower()
    if suffix == ".tsv":
        print(f"TSVファイルを読み込み中: {args.file}")
        questions = load_tsv(args.file)
    elif suffix == ".json":
        print(f"JSONファイルを読み込み中: {args.file}")
        questions = load_json(args.file)
    else:
        print(f"エラー: サポートされていないファイル形式です: {suffix}")
        print("TSV (.tsv) または JSON (.json) を使用してください")
        sys.exit(1)

    print(f"読み込んだ問題数: {len(questions)}")

    # バリデーション
    errors = validate_questions(questions)
    if errors:
        print("\nバリデーションエラー:")
        for err in errors:
            print(f"  - {err}")
        sys.exit(1)

    print("バリデーション: OK")

    # 教科別の内訳表示
    subjects = {}
    for q in questions:
        subj = q.get("subject", "unknown")
        subjects[subj] = subjects.get(subj, 0) + 1

    print("\n教科別内訳:")
    for subj, count in sorted(subjects.items()):
        print(f"  {subj}: {count}問")

    # ドライラン
    if args.dry_run:
        print("\n[ドライラン] 実際の送信はスキップしました")
        sys.exit(0)

    # バッチID
    batch_id = args.batch_id or generate_batch_id()
    print(f"\nバッチID: {batch_id}")

    # GAS に送信
    print("GAS Web App に送信中...")
    result = import_to_gas(questions, batch_id)

    if result.get("success"):
        print(f"\n✅ 成功: {result.get('message', 'インポート完了')}")
        print(f"   バッチID: {result.get('batch_id')}")
        print(f"   インポート数: {result.get('imported_count')}問")
        generated_ids = result.get('generated_ids', [])
        if generated_ids:
            print(f"   生成されたID:")
            for qid in generated_ids:
                print(f"     - {qid}")
    else:
        print(f"\n❌ エラー: {result.get('error', '不明なエラー')}")
        sys.exit(1)


if __name__ == "__main__":
    main()
