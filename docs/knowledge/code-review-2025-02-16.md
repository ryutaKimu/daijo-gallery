# コードレビューレポート - 2025年2月16日

## 概要

**プロジェクト**: Lifetime Canvas（Next.js 16 + Supabase アートギャラリーサイト）
**レビュー日**: 2025年2月16日
**総コード行数**: 866行（node_modules, .next除外）
**ビルド状態**: ✓ 成功
**ESLint状態**: ✓ パス
**TypeScript**: strict モード有効

---

## レビュー観点

以下の4つの観点で包括的なコードレビューを実施：

1. **可読性** - コンポーネント構造、型定義、命名規則
2. **パフォーマンス** - 画像最適化、キャッシュ戦略、再レンダリング
3. **効率的なコード・設計** - DRY原則、コンポーネント再利用性、エラーハンドリング
4. **バグ混在可能性** - Nullチェック、型安全性、エッジケース

---

## 1. 可読性に関する指摘

### 1.1 型定義の不一致（高優先度）

**ファイル**: [frontend/lib/superbase.ts](frontend/lib/superbase.ts)

**問題**:
- Row型: `img_path` (行8, 13)
- Insert型: `image_path` (行23, 34)
- 実行時エラーの原因となる型ミスマッチ

**影響**: データベースとの型不一致により、実行時エラーが発生する可能性

**対応**:
```typescript
// Insert/Update型もimg_pathに統一
export type WorkInsert = Omit<WorkRow, 'id' | 'created_at'>
export type WorkUpdate = Partial<WorkInsert>
```

---

### 1.2 型アサーション（as）の多用（高優先度）

**ファイル**:
- [frontend/components/works/FeaturedGallery.tsx:24,35](frontend/components/works/FeaturedGallery.tsx#L24)
- [frontend/components/works/WorkList.tsx:36,61](frontend/components/works/WorkList.tsx#L36)

**問題**:
```typescript
const { data: tagRows } = (await supabase...) as { data: { work_id: number }[] | null }
```
- TypeScriptの型チェックを迂回している
- Supabaseクライアントの型定義を活用していない
- `error` プロパティの存在を無視

**対応**: Supabase型定義を適切に利用し、`as`を削除

---

### 1.3 定数の重複定義（中優先度）

**問題**: `BLUR_DATA_URL` が2箇所で定義
- [frontend/components/works/FeaturedGallery.tsx:9-10](frontend/components/works/FeaturedGallery.tsx#L9)
- [frontend/components/works/WorkList.tsx:14-15](frontend/components/works/WorkList.tsx#L14)

**対応**: `frontend/lib/constants.ts` に統一

---

### 1.4 ナビゲーションリンクの重複（中優先度）

**問題**: `navLinks` が2箇所で重複定義
- [frontend/components/layout/Header.tsx:3-7](frontend/components/layout/Header.tsx#L3)
- [frontend/components/layout/Footer.tsx:3-7](frontend/components/layout/Footer.tsx#L3)

**対応**: 共通の定数ファイルに移動

---

## 2. パフォーマンスに関する指摘

### 2.1 画像最適化の不十分な実装（中優先度）

**問題点**:

#### a) Blur Data URLの改善
- 現状: 固定の1x1 GIF（最小限のプレースホルダ）
- [FeaturedGallery.tsx:80](frontend/components/works/FeaturedGallery.tsx#L80)
- [WorkList.tsx:114](frontend/components/works/WorkList.tsx#L114)

**改善提案**: `plaiceholder` ライブラリで適切なブラー画像を生成

#### b) 外部画像の最適化不足
- [frontend/app/artist/page.tsx:19](frontend/app/artist/page.tsx#L19)
- `placeholder="blur"` が設定されていない

---

### 2.2 キャッシュ戦略の不完全性（中優先度）

**ファイル**: [frontend/components/works/FeaturedGallery.tsx:54-57](frontend/components/works/FeaturedGallery.tsx#L54)

**問題**:
- `unstable_cache()` は実験的API
- WorkListコンポーネントではキャッシュが未実装
- キャッシュキーがパラメータ変化に対応していない

**対応**: WorkListにもキャッシュ実装を追加

---

### 2.3 Client Componentの状態同期（低優先度）

**ファイル**: [frontend/components/ui/TextSearch.tsx:9](frontend/components/ui/TextSearch.tsx#L9)

**問題**: URLパラメータ変更時に `query` 状態が自動更新されない

**対応**: `useEffect` で同期化

---

## 3. 効率的なコード・設計に関する指摘

### 3.1 クエリ構築の冗長性（中優先度）

**ファイル**: [frontend/components/works/WorkList.tsx:43-57](frontend/components/works/WorkList.tsx#L43)

**問題**:
```typescript
// クエリ条件が重複
if (query) countQuery = countQuery.ilike('title', `%${query}%`)
if (tagFilterIds !== null) countQuery = countQuery.in('id', tagFilterIds)
// 同じ条件をdataQueryにも適用
if (query) dataQuery = dataQuery.ilike('title', `%${query}%`)
if (tagFilterIds !== null) dataQuery = dataQuery.in('id', tagFilterIds)
```

**対応**: クエリビルダー関数を作成してDRY化

```typescript
function applyFilters(query, searchText, tagIds) {
  if (searchText) query = query.ilike('title', `%${searchText}%`)
  if (tagIds !== null) query = query.in('id', tagIds)
  return query
}
```

---

### 3.2 エラーハンドリングの不十分さ（高優先度）

**ファイル**:
- [frontend/components/works/FeaturedGallery.tsx:37-42](frontend/components/works/FeaturedGallery.tsx#L37)
- [frontend/components/works/WorkList.tsx:63-68](frontend/components/works/WorkList.tsx#L63)

**問題**:
```typescript
if (error) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Supabase fetch error:', error)
  }
  return { works: [], totalPages: 0 }
}
```
- 本番環境でエラーが無視される
- ユーザーへのフィードバックなし
- エラーログサービスへの統合がない

**対応**:
- エラーログサービス（Sentry等）への統合
- ユーザーへの適切なエラー表示
- エラー型に応じた対応

---

### 3.3 Server/Client Components の分離（肯定的）

**評価**: ✓ 適切に実装されている

- TextSearch, TagSearch, Pagination は `'use client'`
- FeaturedGallery, WorkList は Server Components
- データ取得はサーバー側で実行

---

## 4. バグ混在可能性に関する指摘

### 4.1 Null チェック漏れ（高優先度・最重要）

**ファイル**:
- [frontend/components/works/FeaturedGallery.tsx:49](frontend/components/works/FeaturedGallery.tsx#L49)
- [frontend/components/works/WorkList.tsx:74](frontend/components/works/WorkList.tsx#L74)

**問題**:
```typescript
imageUrl: supabase.storage.from('gallery-images').getPublicUrl(work.img_path).data.publicUrl
```
- `.data.publicUrl` に直接アクセス
- nullやundefinedが返される可能性

**対応**:
```typescript
const { data } = supabase.storage.from('gallery-images').getPublicUrl(work.img_path)
const imageUrl = data?.publicUrl ?? '/fallback-image.jpg'
```

---

### 4.2 ページネーションパラメータの検証（中優先度）

**ファイル**: [frontend/components/works/WorkList.tsx:40-41](frontend/components/works/WorkList.tsx#L40)

**問題**: `page` が 0 以下の場合のチェックがない

**対応**:
```typescript
const pageNum = Number(params.page)
const page = Number.isInteger(pageNum) && pageNum > 0 ? pageNum : 1
```

---

### 4.3 テキスト検索のエスケープ（低優先度）

**ファイル**: [frontend/components/works/WorkList.tsx:47,55](frontend/components/works/WorkList.tsx#L47)

**問題**: ユーザー入力の `%` 文字がSQLワイルドカードとして解釈される

**対応**: ユーザー入力をエスケープ

---

### 4.4 キャッシュタグの粒度（低優先度）

**ファイル**: [frontend/components/works/FeaturedGallery.tsx:56](frontend/components/works/FeaturedGallery.tsx#L56)

**問題**: キャッシュタグが `['works']` のみで粗い

**対応**: より細かい粒度（例: `['works', 'featured']`）

---

## 5. セキュリティに関する指摘

### 5.1 環境変数のチェック（肯定的）

**ファイル**: [frontend/lib/superbase.ts:109-111](frontend/lib/superbase.ts#L109)

**評価**: ✓ 適切に環境変数をチェックしている

---

### 5.2 開発用画像URLの削除（低優先度）

**ファイル**:
- [frontend/app/artist/page.tsx:19](frontend/app/artist/page.tsx#L19)
- [frontend/next.config.ts](frontend/next.config.ts)

**問題**: `picsum.photos` は本番環境では不要

**対応**: 削除または実画像に置き換え

---

## 改善優先度リスト

### 🔴 高優先度（セキュリティ・バグリスク）

1. **getPublicUrl の null チェック追加**
   - ファイル: FeaturedGallery.tsx:49, WorkList.tsx:74
   - リスク: 実行時エラーの可能性

2. **img_path vs image_path の型定義不一致修正**
   - ファイル: superbase.ts
   - リスク: データベースとの型ミスマッチ

3. **型アサーション（as）の削除**
   - ファイル: FeaturedGallery.tsx, WorkList.tsx
   - リスク: 型安全性の低下

4. **エラーハンドリングの改善**
   - ファイル: FeaturedGallery.tsx, WorkList.tsx
   - リスク: 本番環境でのエラー無視

---

### 🟡 中優先度（パフォーマンス・DRY）

5. **BLUR_DATA_URL の統一化**
   - DRY原則違反

6. **navLinks の統一化**
   - DRY原則違反

7. **クエリ構築の DRY 化**
   - WorkList.tsx

8. **WorkList のキャッシュ実装**
   - パフォーマンス改善

---

### 🟢 低優先度（コード品質）

9. **Button コンポーネントの統一または削除**
10. **テキスト検索の LIKE エスケープ実装**
11. **picsum.photos の削除**（本番環境）
12. **Client Component の状態同期**

---

## 総合評価

| 観点 | 評価 | 備考 |
|------|------|------|
| **可読性** | 7/10 | 型安全性の問題あり。重複定数あり |
| **パフォーマンス** | 7/10 | 画像最適化は基本的。キャッシュ戦略は不完全 |
| **設計** | 8/10 | Server/Client分離は適切。クエリ構築は改善余地 |
| **バグリスク** | 6/10 | null チェック漏れ、型アサーション多用 |
| **セキュリティ** | 8/10 | 基本的には良好。環境変数チェックあり |
| **ビルド/Lint** | 10/10 | エラーなし |

**全体評価**: **7.3/10**

よく構造化されたプロジェクトだが、型安全性とnullチェックの改善が重要。

---

## 実装推奨順序

1. **Phase 1**: 高優先度1-4を実装（セキュリティ・バグリスク対応）
2. **Phase 2**: 中優先度5-8を実装（パフォーマンス・DRY改善）
3. **Phase 3**: 低優先度9-12を実装（コード品質向上）

---

## 次のアクション

- [ ] `frontend/lib/constants.ts` を作成し、共通定数を集約
- [ ] `superbase.ts` の型定義を修正
- [ ] `FeaturedGallery.tsx` と `WorkList.tsx` の型アサーション削除
- [ ] null チェックを追加
- [ ] エラーハンドリングを強化
- [ ] クエリビルダー関数を作成

---

**レビュー担当**: Claude Code
**レビュー方法**: 自動コードレビュー（Exploreエージェント）
**次回レビュー予定**: 改善実装後
