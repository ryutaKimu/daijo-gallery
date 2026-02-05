# 画面一覧

## 一般公開

---

### トップ

- URL: /
- 対象: 一般
- 内容:
  - サイト紹介
  - 代表作品(3件)
- 取得API:
  - GET /api/works?tag=representative&limit=3
  - GET /api/works/work_id
- UI:
  - /代表作遷移ボタン
    - 取得API:
      - GET /api/works/work_id
  - /works遷移ボタン
    - 取得API:
      - api/works
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

---

### 作品詳細

- URL: /works/[id]
- 対象: 一般
- 内容:
  - 作品画像
  - タイトル
  - 制作年
  - prev / next ボタン

- 使用データ:
  - works.id
  - works.title
  - works.description
  - works.year
  - works.image_url

---

### 作者紹介

- URL: /artist
- 対象: 一般
- 内容:
  - アーティスト画像
  - 説明文
