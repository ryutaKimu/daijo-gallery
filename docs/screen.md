# 画面一覧

## 一般公開

---

### トップ

- URL: /
- 対象: 一般
- 内容:
  - サイト紹介
  - 代表作品(3件)
- データ取得:
  - works テーブルから代表作を取得（3件固定）
- UI:
  - /代表作遷移ボタン
    - works 詳細データ取得
  - /works遷移ボタン
  - /artist遷移ボタン

---

### 作品一覧

- URL: /works
- 対象: 一般
- 内容:
  - サムネ一覧
  - タイトル
  - 制作年
  - 検索フォーム
  - ページネーション
- データ取得:
  - works テーブルから一覧取得（ページネーション、検索、タグフィルタ対応）
  - tags テーブルからタグ一覧取得

---

### 作品詳細

- URL: /works/[id]
- 対象: 一般
- 内容:
  - 作品メイン画像
  - タイトル
  - 制作年
  - 説明文
  - 工程画像（type: process）
  - 関連画像（type: related）
  - prev / next ボタン
- 使用データ:
  - works.id
  - works.title
  - works.description
  - works.year
  - works.img_path（Supabase Storage）
  - work_images（work_id で紐づく画像一覧）

---

### 作者紹介

- URL: /artist
- 対象: 一般
- 内容:
  - アーティスト画像
  - 説明文
