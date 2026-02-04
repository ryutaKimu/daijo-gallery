# API設計

## 基本方針

- REST形式
- JSON形式
- Base: /api
- Admin: /api/admin
- Auth: JWT

## ステータスコード

- 200 OK
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Error

## 公開API

### GET /api/works

用途: 作品一覧取得

Query:
- page: int
- limit: int
- q: string

success Response:
- data[]
- meta(page, limit, total, total_pages)
```json
{
  "data": [
    {
      "id": 1,
      "title": "静寂の森",
      "year": 1985,
      "image_url": "/images/works/1.jpg"
    },
    {
      "id": 2,
      "title": "夕暮れの港",
      "year": 1992,
      "image_url": "/images/works/2.jpg"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 82,
    "total_pages": 5
  }
}
```
### GET /api/works/{id}

用途: 作品詳細取得

Response:
- id
- title
- description
- year
- image_url
---
#### Error Responses

##### 400 Bad Request
- page or limit is invalid

##### 500 Internal Server Error

- database error

/api/works?page=-1
/api/works?limit=1000

```json
{
  "error": "Bad Request",
  "message": "page must be greater than 0",
  "code": 400
}
```

```json
{
  "error": "Bad Request",
  "message": "limit must be between 1 and 100",
  "code": 400
}
```

Response 500
```json
{
  "error": "Internal Server Error",
  "message": "failed to fetch works",
  "code": 500
}
```
---

## 管理API

### POST /api/admin/login

### POST /api/admin/works

### PUT /api/admin/works/{id}

### DELETE /api/admin/works/{id}