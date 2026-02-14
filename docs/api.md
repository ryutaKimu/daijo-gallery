# データ取得設計（Supabase）

## 基本方針
- Supabase クライアント（`@supabase/supabase-js`）を使用
- Server Component からデータ取得
- RLS（Row Level Security）で公開 / 管理者のアクセス制御
- 画像は Supabase Storage から取得
- DB にはファイルパスのみ保存し、表示時にフロントエンドで完全な URL を構築する

---

## 画像URL構築

DB の `img_path` にはファイルパス（例: `works/1.jpg`）のみを保存する。
フロントエンドで表示する際に `getPublicUrl()` で完全な URL を構築する。

```ts
// ファイルパスから公開URLを構築
const { data: { publicUrl } } = supabase.storage
  .from('works')
  .getPublicUrl(imgPath)
```

---

## 公開データ取得

### 作品一覧取得

用途: 作品一覧ページ

```ts
const { data, count } = await supabase
  .from('works')
  .select('id, title, year, img_path, tags:works_tags!inner(tag:tags(id, tag_name))', { count: 'exact' })
  .eq('status', true)
  .ilike('title', `%${query}%`)          // テキスト検索（任意）
  .eq('works_tags.tag_id', tagId)        // タグフィルタ（任意、!inner で内部結合）
  .range(offset, offset + limit - 1)
  .order('year', { ascending: false })
```

※ タグフィルタを使わない場合は `!inner` を外し、`.eq('works_tags.tag_id', tagId)` を省略する。

レスポンス例:
```json
{
  "data": [
    {
      "id": 1,
      "title": "静寂の森",
      "year": 1985,
      "img_path": "works/1.jpg",
      "tags": [
        { "tag": { "id": 1, "tag_name": "風景" } },
        { "tag": { "id": 2, "tag_name": "油彩" } }
      ]
    }
  ],
  "count": 82
}
```

### 作品詳細取得

用途: 作品詳細ページ

```ts
const { data } = await supabase
  .from('works')
  .select('id, title, description, year, img_path, tags:works_tags(tag:tags(id, tag_name))')
  .eq('id', id)
  .eq('status', true)
  .single()
```

### 代表作取得

用途: トップページ（3件固定）

```ts
const { data } = await supabase
  .from('works')
  .select('id, title, year, img_path')
  .eq('status', true)
  .in('id', representativeIds)
  .limit(3)
```

### タグ一覧取得

```ts
const { data } = await supabase
  .from('tags')
  .select('id, tag_name')
  .order('id')
```

---

## 管理者操作

### 認証

Supabase Auth を使用（メール / パスワード）

```ts
// ログイン
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// ログアウト
await supabase.auth.signOut()
```

### 作品登録

```ts
// 1. 画像を Storage にアップロード
const { data: file, error: uploadError } = await supabase.storage
  .from('works')
  .upload(`${fileName}`, imageFile)

if (uploadError || !file) {
  throw new Error('画像のアップロードに失敗しました')
}

// 2. works テーブルに挿入（パスのみ保存）
const { data, error } = await supabase
  .from('works')
  .insert({ title, description, year, img_path: file.path, status: true })
  .select()
  .single()

  // 118行目の後に追加
if (!urlData?.publicUrl) {
  await supabase.storage.from('works').remove([file.path]);
  throw new Error('画像URLの取得に失敗しました');
}

// 3. DB 挿入失敗時は Storage の画像を削除（孤児ファイル防止）
if (error) {
  await supabase.storage.from('works').remove([file.path])
  throw new Error('作品の登録に失敗しました')
}
```

### 作品更新（テキスト情報のみ）

```ts
const { data } = await supabase
  .from('works')
  .update({ title, description, year })
  .eq('id', id)
  .select()
  .single()
```

### 作品更新（画像変更あり）

新画像アップロード → DB 更新 → 旧画像削除

```ts
// 1. 現在の画像パスを取得
const { data: work } = await supabase
  .from('works')
  .select('img_path')
  .eq('id', id)
  .single()

// 2. 新しい画像を Storage にアップロード
const { data: file, error: uploadError } = await supabase.storage
  .from('works')
  .upload(`${newFileName}`, newImageFile)

if (uploadError || !file) {
  throw new Error('画像のアップロードに失敗しました')
}

// 3. DB を更新（パスのみ保存）
const { data: updated, error } = await supabase
  .from('works')
  .update({ title, description, year, img_path: file.path })
  .eq('id', id)
  .select()
  .single()

// 4. DB 更新失敗時は新画像を削除（孤児ファイル防止）
if (error) {
  await supabase.storage.from('works').remove([file.path])
  throw new Error('作品の更新に失敗しました')
}

// 5. DB 更新成功後、旧画像を Storage から削除
if (work?.img_path) {
  await supabase.storage.from('works').remove([work.img_path])
}
```

### 作品削除

Storage の画像も合わせて削除する。DB 削除を先に行い、成功後に Storage を削除する。
これにより、DB 削除失敗時に画像だけ消えてしまう不整合を防ぐ。

```ts
// 1. 削除対象の作品から画像パスを取得
const { data: work } = await supabase
  .from('works')
  .select('img_path')
  .eq('id', id)
  .single()

// 2. works テーブルから削除（works_tags は CASCADE で自動削除）
const { error } = await supabase.from('works').delete().eq('id', id)

if (error) {
  throw new Error('作品の削除に失敗しました')
}

// 3. DB 削除成功後、Storage から画像を削除
if (work?.img_path) {
  await supabase.storage.from('works').remove([work.img_path])
}
```

---

## エラーハンドリング

Supabase クライアントはエラーを `error` オブジェクトで返す。

```ts
const { data, error } = await supabase.from('works').select()

if (error) {
  // error.message: エラー詳細
  // error.code: PostgreSQL エラーコード
  console.error(error.message)
}
```

主なエラーケース:
- データ未検出: `.single()` で該当なしの場合 `PGRST116`
- 権限エラー: RLS ポリシー違反時 `42501`
- バリデーション: NOT NULL 違反等 `23502`
