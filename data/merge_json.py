#!/usr/bin/env python3
"""
複数のJSONブロックを含むMarkdownファイルから、
create_book API形式の単一JSONを生成するスクリプト
"""

import json
import re
import os
import sys

def merge_json_from_markdown(input_filename, output_filename):
    # ファイルが存在するか確認
    if not os.path.exists(input_filename):
        print(f"エラー: 入力ファイル '{input_filename}' が見つかりません。")
        return False

    # ファイルを読み込む
    with open(input_filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 正規表現を使って ```json と ``` の間のテキストをすべて抽出する
    json_blocks = re.findall(r'```json\s*(.*?)\s*```', content, re.DOTALL)

    # Markdownエスケープを除去する関数
    def unescape_markdown(text):
        # \_ → _、\[ → [、\] → ] などを修正
        text = text.replace('\\_', '_')
        text = text.replace('\\[', '[')
        text = text.replace('\\]', ']')
        text = text.replace('\\*', '*')
        text = text.replace('\\`', '`')
        return text

    # 各ブロックのエスケープを除去
    json_blocks = [unescape_markdown(block) for block in json_blocks]

    if not json_blocks:
        print("警告: JSONブロックが見つかりませんでした。")
        return False

    # 最初のブロックからメタ情報を取得
    first_data = json.loads(json_blocks[0])

    # 最終的なJSON構造の初期化
    merged_data = {
        "action": first_data.get("action", "create_book"),
        "subject": first_data.get("subject", "jp"),
        "title": first_data.get("title", "Unknown"),
        "questions": []
    }

    print(f"{len(json_blocks)} 個のJSONブロックが見つかりました。結合を開始します...")

    # 各ブロックを解析して結合
    for i, block_str in enumerate(json_blocks):
        try:
            data = json.loads(block_str)

            # questionsキーがある場合、リストに追加する
            if "questions" in data and isinstance(data["questions"], list):
                merged_data["questions"].extend(data["questions"])
                print(f"  ブロック {i+1}: {len(data['questions'])} 問を追加")
            else:
                print(f"  ブロック {i+1}: 'questions' リストが含まれていません。スキップします。")

        except json.JSONDecodeError as e:
            print(f"  ブロック {i+1} の解析中にエラーが発生しました: {e}")

    # 結果をファイルに書き出す
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, ensure_ascii=False, indent=2)

    print("-" * 50)
    print(f"完了しました。")
    print(f"出力ファイル: {output_filename}")
    print(f"結合された問題数: {len(merged_data['questions'])}")
    print(f"タイトル: {merged_data['title']}")
    print(f"教科: {merged_data['subject']}")

    return True

if __name__ == "__main__":
    # コマンドライン引数またはデフォルト値
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    else:
        # デフォルト: 同じディレクトリ内の.mdファイルを探す
        input_file = "中学入試にでる順 改訂第2版 四字熟語・ことわざ・慣用句.md"

    # 出力ファイル名を生成（.md → .json）
    base_name = os.path.splitext(input_file)[0]
    output_file = f"{base_name}.json"

    merge_json_from_markdown(input_file, output_file)
