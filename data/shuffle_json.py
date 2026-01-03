#!/usr/bin/env python3
"""
クイズの選択肢をシャッフルし、correct_indexを更新するスクリプト
"""

import json
import random
import os
import sys


def shuffle_quiz_choices(input_filename, output_filename):
    # ファイルの読み込み
    if not os.path.exists(input_filename):
        print(f"エラー: 入力ファイル '{input_filename}' が見つかりません。")
        return False

    print(f"ファイルを読み込んでいます: {input_filename}")
    with open(input_filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data.get("questions", [])
    print(f"全 {len(questions)} 問のシャッフルを開始します...")

    # 統計用（シャッフル後の正解分布を確認するため）
    stats = {0: 0, 1: 0, 2: 0, 3: 0}

    for q in questions:
        # 1. 現在の正解のインデックスと、その文章内容を取得
        # 元データが1-4の場合と0-3の場合の両方に対応
        original_idx = int(q.get("correct_index", 1))

        # 選択肢のキーリスト
        choice_keys = ["choice_1", "choice_2", "choice_3", "choice_4"]

        # 1-4形式の場合はそのまま、0-3形式の場合は+1してchoice_Nに対応
        if original_idx >= 1 and original_idx <= 4:
            correct_text = q.get(f"choice_{original_idx}")
        else:
            correct_text = q.get(f"choice_{original_idx + 1}")

        # 2. 全選択肢のテキストをリスト化して取得
        choices_content = []
        for key in choice_keys:
            choices_content.append(q.get(key, ""))

        # 3. 選択肢リストをランダムにシャッフルする
        random.shuffle(choices_content)

        # 4. シャッフルした内容を元のキーに書き戻し、正解の場所を探す
        for i, text in enumerate(choices_content):
            key = f"choice_{i + 1}"  # choice_1〜choice_4

            # テキストをセット
            q[key] = text

            # もしこのテキストが「正解のテキスト」なら、正解番号を更新（0-3形式）
            if text == correct_text:
                q["correct_index"] = i  # 0〜3

        # 統計用にカウント
        stats[q["correct_index"]] += 1

    # 結果を保存
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("-" * 50)
    print("シャッフルが完了しました。")
    print(f"出力ファイル: {output_filename}")
    print("【シャッフル後の正解分布（0-3形式）】")
    for k in sorted(stats.keys()):
        pct = stats[k] / len(questions) * 100 if questions else 0
        print(f"  correct_index {k}: {stats[k]} 問 ({pct:.1f}%)")

    return True


if __name__ == "__main__":
    # コマンドライン引数またはデフォルト値
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
    else:
        input_file = "中学入試にでる順 改訂第2版 四字熟語・ことわざ・慣用句.json"

    # 出力ファイル名を生成（_shuffled を付加）
    base_name = os.path.splitext(input_file)[0]
    output_file = f"{base_name}_shuffled.json"

    shuffle_quiz_choices(input_file, output_file)
