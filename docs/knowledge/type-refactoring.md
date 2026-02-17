# 型定義の共通化リファクタリング

## 日付
2026-02-17

## 概要
Supabaseクエリのレスポンス型が複数箇所で重複していたため、再利用可能なジェネリック型に共通化。

## 問題点

### 修正前のコード
`frontend/app/works/[id]/page.tsx` の3箇所で同じパターンが繰り返されていた：

```typescript
// 49行目
.single()) as { data: WorkDetailRow | null; error: PostgrestError | null }

// 105行目
.neq('work_id', workId)) as { data: WorkTagRow[] | null; error: PostgrestError | null }

// 130行目
.limit(4)) as { data: RelatedWorkRow[] | null; error: PostgrestError | null }
```

### 課題
- **DRY原則違反**: 同じ型構造が繰り返される
- **保守性の低下**: 型を変更する場合、複数箇所を修正する必要がある
- **可読性の低下**: 長い型アサーションでコードが冗長

## 解決策

### 1. ジェネリック型の定義
`frontend/lib/supabase-types.ts` を新規作成：

```typescript
import type { PostgrestError } from '@supabase/postgrest-js'

/**
 * Supabaseクエリの標準的なレスポンス型
 * 単一レコード、配列、どちらにも対応可能
 */
export type SupabaseResponse<T> = {
  data: T | null
  error: PostgrestError | null
}

/**
 * 配列データのレスポンス型（型の明示性向上のため）
 */
export type SupabaseArrayResponse<T> = {
  data: T[] | null
  error: PostgrestError | null
}
```

### 2. 修正後のコード

```typescript
// インポート
import { SupabaseResponse, SupabaseArrayResponse } from '@/lib/supabase-types'

// 49行目: 単一レコード
.single()) as SupabaseResponse<WorkDetailRow>

// 105行目: 配列
.neq('work_id', workId)) as SupabaseArrayResponse<WorkTagRow>

// 130行目: 配列
.limit(4)) as SupabaseArrayResponse<RelatedWorkRow>
```

## メリット

### 1. **コードの簡潔化**
- 型アサーションが1行で済む
- `PostgrestError` の繰り返しインポートが不要

### 2. **保守性の向上**
- 型定義の変更が1箇所で完結
- 他のファイルでも再利用可能（`import` するだけ）

### 3. **可読性の向上**
- 型名から意図が明確に伝わる
- ジェネリクスでデータ構造が一目瞭然

### 4. **型安全性の維持**
- TypeScriptの型チェックは完全に機能
- リファクタリング前後で型の厳密性は同等

## 適用範囲

この型定義は以下の場面で再利用可能：

- **Server Components**: データ取得時の型アサーション
- **API Routes**: Supabaseクエリのレスポンス型
- **キャッシュ関数**: `unstable_cache()` 内部のfetch処理

## 関連ファイル

- [lib/supabase-types.ts](../frontend/lib/supabase-types.ts) — 型定義ファイル
- [app/works/[id]/page.tsx](../frontend/app/works/[id]/page.tsx) — 適用例

## 今後の展開

### 他ファイルへの適用候補
以下のファイルでも同様のパターンが見られる可能性：

- `frontend/app/works/page.tsx` — 作品一覧取得
- `frontend/app/artist/page.tsx` — アーティスト情報取得

これらも順次リファクタリングを検討すべき。

### さらなる共通化の可能性
Supabaseクライアントのラッパー関数を作成し、型アサーションを内包することも検討できる：

```typescript
// 例: lib/supabase-helpers.ts
export async function querySupabase<T>(
  queryBuilder: SupabaseQueryBuilder
): Promise<SupabaseResponse<T>> {
  return await queryBuilder as SupabaseResponse<T>
}
```

ただし、過度な抽象化は避け、必要性を見極めること。

## 教訓

### ✅ 良い点
- ユーザーの指摘を受けて即座に改善できた
- ジェネリック型の適切な活用例となった
- ドキュメント化により知見を蓄積

### ⚠️ 注意点
- 抽象化は「3回繰り返したら」がセオリー（今回は3回で適切）
- 型定義ファイルの配置場所は要検討（`lib/` vs `types/`）
- 他のチームメンバーへの共有が必要

## 参考リンク

- [TypeScript Generics - 公式ドキュメント](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [DRY原則 - Wikipedia](https://ja.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [Supabase - TypeScript型定義](https://supabase.com/docs/reference/javascript/typescript-support)
