
## データ設計
---
- テーブル名: works
- 利用用途: 作品画像、タイトル、作品説明、作成年を管理。
- 必須データ
  - id 
  - title
  - description
  - year
  - status
  - img_url
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

## works

| 列名 | 型 | 制約 | 説明
|------|----|-----|----|
| id | bigInt | PK | 主キー|
| title | text | NOT NULL DEFAULT '無題'| タイトル |
| description | text | NULL | 作品説明 |
| year | int | NULL | 作品年 |
| status | boolean | NOT NULL | 公開状態 |
| img_url | text | NOT NULL | 作品url |
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