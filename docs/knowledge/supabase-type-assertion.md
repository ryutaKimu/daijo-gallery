# Supabase リレーションクエリでの型推論エラーと解決策

## 概要

Supabase + TypeScriptでネストしたリレーションクエリを使用すると、型推論が失敗し`Property 'xxx' does not exist on type 'never'`というビルドエラーが発生することがあります。このドキュメントでは、その原因と解決策をまとめます。

## 発生したエラー

### エラーメッセージ
```
./app/works/[id]/page.tsx:58:28
Property 'img_path' does not exist on type 'never'.
```

### 問題のコード

```typescript
async function fetchWorkDetail(workId: string): Promise<WorkDetail | null> {
  const { data: workData, error } = await supabase
    .from('works')
    .select(`
      id,
      title,
      description,
      year,
      img_path,
      works_tags(
        tags(
          id,
          tag_name
        )
      )
    `)
    .eq('id', workId)
    .eq('status', true)
    .single()

  if (error || !workData) {
    console.error('Work fetch error:', error)
    return null
  }

  // ❌ ここで型エラー: workDataの型がneverと推論される
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(workData.img_path) // Property 'img_path' does not exist on type 'never'
}
```

## 原因

Supabase + TypeScriptの組み合わせでは、以下のケースで型推論が失敗します：

### 1. ネストしたリレーションクエリ
`works_tags(tags(...))`のような複雑なクエリでは、TypeScriptの型推論が正しく動作しません。

### 2. Database型の制限
Supabaseの`Database`型はテーブル単体の型定義であり、JOINやリレーション結果の型は自動推論されません。

```typescript
// superbase.ts
export type Database = {
  public: {
    Tables: {
      works: {
        Row: {
          id: number
          title: string
          // ... テーブル定義のみ
        }
      }
    }
  }
}
```

### 3. `.single()`の戻り値
単一行を返すクエリ(`single()`)でも、複雑なクエリでは型推論が`never`になることがあります。

## 解決策

### 方法: 明示的な型アサーションの使用

クエリ全体に型アサーションを追加することで、TypeScriptの型推論の失敗を回避します。

#### Step 1: クエリ結果の型を定義

```typescript
type WorkDetailRow = {
  id: number
  title: string
  description: string | null
  year: string | null
  img_path: string
  works_tags: {
    tags: {
      id: number
      tag_name: string
    }
  }[]
}
```

#### Step 2: 型アサーションを追加

```typescript
async function fetchWorkDetail(workId: string): Promise<WorkDetail | null> {
  // ✅ 型アサーションを追加
  const { data: workData, error } = (await supabase
    .from('works')
    .select(`
      id,
      title,
      description,
      year,
      img_path,
      works_tags(
        tags(
          id,
          tag_name
        )
      )
    `)
    .eq('id', workId)
    .eq('status', true)
    .single()) as { data: WorkDetailRow | null; error: any }

  if (error || !workData) {
    console.error('Work fetch error:', error)
    return null
  }

  // ✅ これ以降は型推論が正しく動作
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(workData.img_path) // OK

  const imageUrl = urlData?.publicUrl ?? FALLBACK_IMAGE

  const tags = workData.works_tags.map((wt) => ({
    id: wt.tags.id,
    name: wt.tags.tag_name,
  }))

  return {
    id: workData.id,
    title: workData.title,
    description: workData.description,
    year: workData.year ?? '',
    imageUrl,
    tags,
  }
}
```

## 既存コードベースとの一貫性

プロジェクト内の他のコードでも同様のパターンが使われています。

### FeaturedGallery.tsx の例

```typescript
// frontend/components/works/FeaturedGallery.tsx (line 11-17)
type WorkRow = {
  id: number
  title: string
  year: string | null
  img_path: string
  works_tags: { tag_id: number }[]
}

// line 50-61
return worksData.map((work: WorkRow) => {
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(work.img_path)
  // ...
})
```

こちらは`map`内で型を指定していますが、今回はクエリ全体に型アサーションを使用します。

## 適用例

### 単純なクエリ（型推論が動作する場合）

```typescript
// シンプルなクエリでは型推論が動作する
const { data: works, error } = await supabase
  .from('works')
  .select('id, title, img_path')
  .eq('status', true)
  .limit(10)

// worksの型は自動的に推論される
```

### 複雑なクエリ（型アサーションが必要な場合）

```typescript
// ネストしたリレーションでは型アサーションが必要
type ComplexRow = {
  id: number
  title: string
  works_tags: {
    tags: {
      id: number
      tag_name: string
    }
  }[]
}

const { data: works, error } = (await supabase
  .from('works')
  .select(`
    id,
    title,
    works_tags(
      tags(
        id,
        tag_name
      )
    )
  `)
  .eq('status', true)
  .single()) as { data: ComplexRow | null; error: any }
```

## 注意点

### 型アサーションの安全性

- 型アサーションは「この型であることを保証する」という開発者の意図を示すもの
- 実行時に型が一致しない場合、ランタイムエラーが発生する可能性がある
- Supabaseのクエリ結果と型定義が一致していることを確認する必要がある

### 型定義のメンテナンス

- データベーススキーマが変更された場合、型定義も更新する必要がある
- `WorkDetailRow`のような型定義は、実際のクエリ結果と一致するように保つ

### エラーハンドリング

型アサーションを使用しても、エラーハンドリングは必須です：

```typescript
const { data, error } = (await supabase...) as { data: T | null; error: any }

if (error || !data) {
  console.error('Error:', error)
  return fallback
}

// ここでdataは型Tとして使用可能
```

## まとめ

Supabaseのネストしたリレーションクエリでは、TypeScriptの型推論が失敗することがあります。この問題は、クエリ結果に明示的な型アサーションを追加することで解決できます。

**重要なポイント**:
1. 複雑なクエリ結果の型を定義する
2. クエリ全体に `as { data: T | null; error: any }` を追加
3. 型定義とクエリ結果が一致することを確認
4. エラーハンドリングを忘れない

この手法により、型安全性を保ちながらSupabaseのリレーションクエリを活用できます。

## 関連ファイル

- `frontend/app/works/[id]/page.tsx` - 型アサーションを使用した実装例
- `frontend/components/works/FeaturedGallery.tsx` - 既存の型指定パターン
- `frontend/lib/superbase.ts` - Database型定義

## 更新履歴

- 2026-02-17: 初版作成（作品詳細ページのビルドエラー修正時）
