
## データ設計（Supabase PostgreSQL）
---
- テーブル名: works
- 利用用途: 作品画像、タイトル、作品説明、作成年を管理。
- 必須データ
  - id
  - title
  - description
  - year
  - status
  - img_path
---
- テーブル名: tags
- 利用用途: 作品のタグを管理。
- 必須データ
  - id
  - tag_name
  - created_at
---

- テーブル名: works_tags
- 利用用途: 作品とタグのidを管理する中間テーブル。
- 必須データ
  - works_id
  - tags_id
---
- テーブル名: work_images
- 利用用途: 作品の工程画像・関連画像を管理。
- 必須データ
  - id
  - work_id
  - type
  - img_path
  - sort_order
---

## works

| 列名 | 型 | 制約 | 説明
|------|----|-----|----|
| id | bigInt | PK | 主キー|
| title | text | NOT NULL DEFAULT '無題'| タイトル |
| description | text | NULL | 作品説明 |
| year | int | NULL | 作品年 |
| status | boolean | NOT NULL | 公開状態 |
| img_path | text | NOT NULL | Storage ファイルパス |
| created_at | timestamptz | DEFAULT TIMESTAMP | 作成日時 |
| updated_at | timestamptz | DEFAULT TIMESTAMP | 更新日時 |

Constraints:
- PRIMARY KEY (id)

## tags

| 列名 | 型 | 制約 | 説明
|------|----|-----|----|
| id | bigInt | PK | 主キー
| tag_name | text | NOT NULL | タグネーム
| created_at | timestamptz | DEFAULT TIMESTAMP | 作成日時 |
| updated_at | timestamptz | DEFAULT TIMESTAMP | 更新日時 |

Constraints:
- PRIMARY KEY (id)

## works_tags

| 列名 | 型 | 制約 | 説明
|------|----|-----|----|
| work_id | bigInt | NOT NULL | 作品外部キー
| tag_id | bigInt | NOT NULL | タグ外部キー

Constraints:
- PRIMARY KEY (work_id, tag_id)
- FOREIGN KEY (work_id) REFERENCES works(id)
- FOREIGN KEY (tag_id) REFERENCES tags(id)

---

## work_images

| 列名 | 型 | 制約 | 説明
|------|----|-----|----|
| id | bigInt | PK | 主キー |
| work_id | bigInt | NOT NULL | 作品外部キー |
| type | text | NOT NULL | 画像種別（process / related） |
| img_path | text | NOT NULL | Storage ファイルパス |
| sort_order | int | NOT NULL DEFAULT 0 | 表示順 |
| caption | text | NULL | 画像の説明（例: 下絵、着彩、展示風景） |
| created_at | timestamptz | DEFAULT TIMESTAMP | 作成日時 |

Constraints:
- PRIMARY KEY (id)
- FOREIGN KEY (work_id) REFERENCES works(id)

---

## RLS（Row Level Security）ポリシー

### works

| 操作 | ポリシー | 対象 |
|------|---------|------|
| SELECT | `status = true` | 一般ユーザー（anon） |
| SELECT | 全件 | 認証済み管理者 |
| INSERT | 許可 | 認証済み管理者 |
| UPDATE | 許可 | 認証済み管理者 |
| DELETE | 許可 | 認証済み管理者 |

### tags

| 操作 | ポリシー | 対象 |
|------|---------|------|
| SELECT | 全件 | 全ユーザー |
| INSERT / UPDATE / DELETE | 許可 | 認証済み管理者 |

### works_tags

| 操作 | ポリシー | 対象 |
|------|---------|------|
| SELECT | 全件 | 全ユーザー |
| INSERT / DELETE | 許可 | 認証済み管理者 |

### work_images

| 操作 | ポリシー | 対象 |
|------|---------|------|
| SELECT | work の status = true に紐づくもの | 一般ユーザー（anon） |
| SELECT | 全件 | 認証済み管理者 |
| INSERT / UPDATE / DELETE | 許可 | 認証済み管理者 |

---

## Supabase Storage

### バケット: `works`

| 設定 | 値 |
|------|-----|
| 公開設定 | パブリック |
| 用途 | 作品画像の保存 |
| 許可ファイル形式 | image/jpeg, image/png, image/webp |
| 最大ファイルサイズ | 5MB |

### アクセスポリシー

| 操作 | 対象 |
|------|------|
| SELECT（閲覧） | 全ユーザー |
| INSERT（アップロード） | 認証済み管理者 |
| UPDATE（上書き） | 認証済み管理者 |
| DELETE（削除） | 認証済み管理者 |
