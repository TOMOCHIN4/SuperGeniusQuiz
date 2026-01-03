元のデータが「正解は常に1」のようになっていると、クイズとして機能しないため、選択肢（choice）をシャッフルして、それに追従するように正解番号（correct\_index）を更新する処理が必要です。



以下のPythonコードは、前のステップで結合した `merged\_book.json` を読み込み、\*\*すべての問題の選択肢をランダムに並べ替え、正解の番号を正しい位置に更新\*\*して、新しいファイルとして保存します。



\### 処理のロジック

1\. 問題ごとに、現在の「正解の文章」を取得します。

2\. `choice\_1` ～ `choice\_4` の文章をリストにまとめて、ランダムにシャッフルします。

3\. シャッフルされた文章を再び `choice\_1` ～ `choice\_4` に書き戻します。

4\. 「正解の文章」が今どこ（何番）にあるかを探し、`correct\_index` をその番号に書き換えます。



\### Pythonコード



```python

import json

import random

import os



def shuffle\_quiz\_choices(input\_filename, output\_filename):

&nbsp;   # ファイルの読み込み

&nbsp;   if not os.path.exists(input\_filename):

&nbsp;       print(f"エラー: 入力ファイル '{input\_filename}' が見つかりません。")

&nbsp;       return



&nbsp;   print(f"ファイルを読み込んでいます: {input\_filename}")

&nbsp;   with open(input\_filename, 'r', encoding='utf-8') as f:

&nbsp;       data = json.load(f)



&nbsp;   questions = data.get("questions", \[])

&nbsp;   print(f"全 {len(questions)} 問のシャッフルを開始します...")



&nbsp;   # 統計用（シャッフル後の正解分布を確認するため）

&nbsp;   stats = {1: 0, 2: 0, 3: 0, 4: 0}



&nbsp;   for q in questions:

&nbsp;       # 1. 現在の正解のインデックスと、その文章内容を取得

&nbsp;       # (万が一 correct\_index が文字列だった場合に備えて int() で変換)

&nbsp;       original\_idx = int(q.get("correct\_index", 1))

&nbsp;       

&nbsp;       # 選択肢のキーリスト

&nbsp;       choice\_keys = \["choice\_1", "choice\_2", "choice\_3", "choice\_4"]

&nbsp;       

&nbsp;       # 現在の正解のテキストを保存しておく

&nbsp;       correct\_text = q.get(f"choice\_{original\_idx}")



&nbsp;       # 2. 全選択肢のテキストをリスト化して取得

&nbsp;       choices\_content = \[]

&nbsp;       for key in choice\_keys:

&nbsp;           choices\_content.append(q.get(key, ""))



&nbsp;       # 3. 選択肢リストをランダムにシャッフルする

&nbsp;       random.shuffle(choices\_content)



&nbsp;       # 4. シャッフルした内容を元のキーに書き戻し、正解の場所を探す

&nbsp;       for i, text in enumerate(choices\_content):

&nbsp;           # 新しい番号 (1~4)

&nbsp;           new\_idx = i + 1

&nbsp;           key = f"choice\_{new\_idx}"

&nbsp;           

&nbsp;           # テキストをセット

&nbsp;           q\[key] = text



&nbsp;           # もしこのテキストが「正解のテキスト」なら、正解番号を更新

&nbsp;           if text == correct\_text:

&nbsp;               q\["correct\_index"] = new\_idx

&nbsp;       

&nbsp;       # 統計用にカウント

&nbsp;       stats\[q\["correct\_index"]] += 1



&nbsp;   # 結果を保存

&nbsp;   with open(output\_filename, 'w', encoding='utf-8') as f:

&nbsp;       json.dump(data, f, ensure\_ascii=False, indent=2)



&nbsp;   print("-" \* 30)

&nbsp;   print("シャッフルが完了しました。")

&nbsp;   print(f"出力ファイル: {output\_filename}")

&nbsp;   print("【シャッフル後の正解分布】")

&nbsp;   for k in sorted(stats.keys()):

&nbsp;       print(f"  選択肢 {k}: {stats\[k]} 問")



if \_\_name\_\_ == "\_\_main\_\_":

&nbsp;   # 前回のステップで作成した結合ファイルを指定

&nbsp;   input\_file = "merged\_book.json"

&nbsp;   # 新しく保存するファイル名

&nbsp;   output\_file = "shuffled\_book.json"



&nbsp;   shuffle\_quiz\_choices(input\_file, output\_file)

```



\### 使い方



1\.  さきほど作成した `merged\_book.json` があるフォルダに、このスクリプトを保存します（例: `shuffle\_json.py`）。

2\.  実行すると、`shuffled\_book.json` が生成されます。

3\.  実行時のログに「正解分布」が表示されます。これでおおよそ均等（25%ずつ）にばらけていれば成功です。



\### 補足

このコードは「選択肢1と3を入れ替える」という特定ペアの交換ではなく、\*\*「4つの選択肢すべてを混ぜ合わせる（完全シャッフル）」\*\*を行っています。これにより、正解以外の選択肢（ダミー選択肢）の並び順もランダムになるため、クイズとしての質がより向上します。

