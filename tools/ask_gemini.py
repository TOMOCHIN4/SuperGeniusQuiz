#!/usr/bin/env python3
"""
外部意見者（Gemini 3 Pro）に意見を求めるツール

Usage:
    python ask_gemini.py "質問内容"
    python ask_gemini.py --file question.txt
    python ask_gemini.py  # 対話モード

環境変数:
    GEMINI_API_KEY: Gemini API キー（.env または環境変数から読み込み）
"""

import os
import sys
import argparse
from pathlib import Path
from google import genai
from google.genai import types


def load_env():
    """プロジェクトルートの.envファイルを読み込む"""
    # スクリプトの親ディレクトリ（tools/）の親（プロジェクトルート）
    project_root = Path(__file__).parent.parent
    env_file = project_root / ".env"

    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # "KEY: VALUE" または "KEY=VALUE" 形式に対応
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


# .env を読み込み
load_env()


# 設定
MODEL_ID = "gemini-3-pro-preview"
DEFAULT_THINKING_LEVEL = "high"  # low, high (Pro), minimal/medium (Flashのみ)

# システムプロンプト: 外部意見者としての立場を明確化
SYSTEM_PROMPT = """あなたは SuperGeniusQuiz v4 プロジェクトの外部意見者です。

## あなたの立場
- ユーザー（プロジェクトオーナー）、ClaudeCode（開発部）と対等な立場
- 忖度なしで本音の意見を述べる
- エンジニアリングのバイアスを指摘する
- 実用性・ユーザー体験を重視した視点で助言する

## プロジェクト概要
- 小学生向け4択クイズ学習アプリ
- 技術スタック: GAS + Google Sheets + HTML/JS
- ユーザー: 家族3人
- 現在: MVP完成、問題データ拡充フェーズ

## 回答スタイル
- 簡潔かつ具体的に
- 問題点があれば遠慮なく指摘
- 代替案があれば提示
- 必要なら優先順位の再検討を提案
"""


def create_client() -> genai.Client:
    """Gemini クライアントを作成"""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "環境変数 GEMINI_API_KEY が設定されていません。\n"
            "設定方法: export GEMINI_API_KEY='your-api-key'"
        )
    return genai.Client(api_key=api_key)


def ask_gemini(
    question: str,
    thinking_level: str = DEFAULT_THINKING_LEVEL,
    include_system_prompt: bool = True
) -> str:
    """
    Gemini 3 Pro に質問を投げて回答を得る

    Args:
        question: 質問内容
        thinking_level: 推論の深さ ("low" or "high")
        include_system_prompt: システムプロンプトを含めるか

    Returns:
        Gemini からの回答テキスト
    """
    client = create_client()

    # プロンプト構築
    if include_system_prompt:
        full_prompt = f"{SYSTEM_PROMPT}\n\n---\n\n## 質問\n{question}"
    else:
        full_prompt = question

    # API呼び出し
    try:
        # thinking_config が使える場合
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(thinking_level=thinking_level)
            ),
        )
    except Exception:
        # SDK バージョンが古い場合はシンプルに呼び出し
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=full_prompt,
        )

    return response.text


def interactive_mode():
    """対話モード"""
    print("=" * 60)
    print("Gemini 3 Pro 外部意見者モード")
    print("終了: 'exit' または 'quit' を入力")
    print("=" * 60)

    while True:
        try:
            print("\n質問を入力してください:")
            lines = []
            while True:
                line = input()
                if line.strip().lower() in ["exit", "quit"]:
                    print("終了します。")
                    return
                if line == "":
                    if lines:
                        break
                    continue
                lines.append(line)

            question = "\n".join(lines)
            if not question.strip():
                continue

            print("\n考え中...")
            answer = ask_gemini(question)
            print("\n" + "=" * 60)
            print("【Gemini 外部意見】")
            print("=" * 60)
            print(answer)

        except KeyboardInterrupt:
            print("\n終了します。")
            break
        except Exception as e:
            print(f"エラー: {e}")


def main():
    parser = argparse.ArgumentParser(
        description="Gemini 3 Pro に外部意見を求める"
    )
    parser.add_argument(
        "question",
        nargs="?",
        help="質問内容（省略時は対話モード）"
    )
    parser.add_argument(
        "--file", "-f",
        help="質問内容を含むファイルパス"
    )
    parser.add_argument(
        "--thinking", "-t",
        choices=["low", "high"],
        default=DEFAULT_THINKING_LEVEL,
        help=f"推論の深さ (default: {DEFAULT_THINKING_LEVEL})"
    )
    parser.add_argument(
        "--raw", "-r",
        action="store_true",
        help="システムプロンプトなしで質問"
    )

    args = parser.parse_args()

    # 質問内容の取得
    if args.file:
        with open(args.file, "r", encoding="utf-8") as f:
            question = f.read()
    elif args.question:
        question = args.question
    else:
        # 対話モード
        interactive_mode()
        return

    # API呼び出し
    try:
        answer = ask_gemini(
            question,
            thinking_level=args.thinking,
            include_system_prompt=not args.raw
        )
        print(answer)
    except Exception as e:
        print(f"エラー: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
