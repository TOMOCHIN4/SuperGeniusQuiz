ファイル（テキスト）には、Markdownのコードブロック（` ```json ... ``` `）の中に複数のJSONオブジェクトが分かれて記述されています。



これらを読み込み、冒頭のヘッダー情報（action, subject, title）を維持しつつ、すべての `questions` リストを一つに結合して、単一のJSONファイルとして出力するPythonスクリプトを作成しました。



\### 使用方法



Pythonを実行すると、結合された `merged\_book.json` が生成されますが元ファイルと同じ名前にしたい場合はリネーム処理を追加してください



\### Pythonコード



```python

import json

import re

import os



def merge\_json\_from\_markdown(input\_filename, output\_filename):

&nbsp;   # ファイルが存在するか確認

&nbsp;   if not os.path.exists(input\_filename):

&nbsp;       print(f"エラー: 入力ファイル '{input\_filename}' が見つかりません。")

&nbsp;       return



&nbsp;   # ファイルを読み込む

&nbsp;   with open(input\_filename, 'r', encoding='utf-8') as f:

&nbsp;       content = f.read()



&nbsp;   # 正規表現を使って ```json と ``` の間のテキストをすべて抽出する

&nbsp;   # re.DOTALL は改行を含むすべての文字にマッチさせるために使用

&nbsp;   json\_blocks = re.findall(r'```json\\s\*(.\*?)\\s\*```', content, re.DOTALL)



&nbsp;   if not json\_blocks:

&nbsp;       print("警告: JSONブロックが見つかりませんでした。")

&nbsp;       return



&nbsp;   # 最終的なJSON構造の初期化

&nbsp;   # タイトルなどは最初のブロック、または指定のものを使用

&nbsp;   merged\_data = {

&nbsp;       "action": "create\_book",

&nbsp;       "subject": "jp",

&nbsp;       "title": "中学入試にでる順 改訂第2版 四字熟語・ことわざ・慣用句",

&nbsp;       "questions": \[]

&nbsp;   }



&nbsp;   print(f"{len(json\_blocks)} 個のJSONブロックが見つかりました。結合を開始します...")



&nbsp;   # 各ブロックを解析して結合

&nbsp;   for i, block\_str in enumerate(json\_blocks):

&nbsp;       try:

&nbsp;           data = json.loads(block\_str)

&nbsp;           

&nbsp;           # questionsキーがある場合、リストに追加する

&nbsp;           if "questions" in data and isinstance(data\["questions"], list):

&nbsp;               merged\_data\["questions"].extend(data\["questions"])

&nbsp;           else:

&nbsp;               print(f"ブロック {i+1}: 'questions' リストが含まれていません。スキップします。")



&nbsp;       except json.JSONDecodeError as e:

&nbsp;           print(f"ブロック {i+1} の解析中にエラーが発生しました: {e}")



&nbsp;   # 結果をファイルに書き出す

&nbsp;   with open(output\_filename, 'w', encoding='utf-8') as f:

&nbsp;       json.dump(merged\_data, f, ensure\_ascii=False, indent=2)



&nbsp;   print("-" \* 30)

&nbsp;   print(f"完了しました。")

&nbsp;   print(f"出力ファイル: {output\_filename}")

&nbsp;   print(f"結合された問題数: {len(merged\_data\['questions'])}")



if \_\_name\_\_ == "\_\_main\_\_":

&nbsp;   # 入力ファイル名（テキストを保存したファイル）

&nbsp;   input\_file = "source.md"

&nbsp;   # 出力ファイル名

&nbsp;   output\_file = "merged\_book.json"



&nbsp;   merge\_json\_from\_markdown(input\_file, output\_file)

```



\### 処理の解説



1\.  \*\*正規表現による抽出\*\*: ファイル全体を文字列として読み込み、`re.findall` を使ってMarkdownのコードブロック記法 ` ```json ` から ` ``` ` までの間の文字列をリストとして抽出します。

2\.  \*\*ベースの作成\*\*: 指定されたタイトル（`中学入試にでる順 改訂第2版 四字熟語・ことわざ・慣用句`）を持つ辞書オブジェクトを作成します。

3\.  \*\*リストの拡張（Extend）\*\*: 抽出した各JSONテキストを `json.loads` でオブジェクトに変換し、その中にある `"questions"` リストの中身を、ベースの `"questions"` リストに追加（extend）していきます。

4\.  \*\*保存\*\*: 整形（indent=2）してJSONファイルとして保存します。日本語が文字化けしないよう `ensure\_ascii=False` を設定しています。

