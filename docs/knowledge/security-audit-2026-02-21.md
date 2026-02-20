# セキュリティ脆弱性診断 — 2026-02-21

対象: `frontend/` 全体
実施: Claude Code (claude-sonnet-4-6)

---

## 診断結果サマリー

| 深刻度 | 件数 |
|--------|------|
| HIGH   | 1    |
| MEDIUM | 2    |
| LOW    | 2    |
| INFO   | 1    |

---

## 指摘事項

### [HIGH] Supabaseプロジェクト固有IDのハードコード

**ファイル:** `frontend/next.config.ts:8`

```ts
// 現状: プロジェクトIDがgitにコミットされる
hostname: 'wudvvdochvfhijtseqjw.supabase.co',
```

**リスク:** Supabaseプロジェクト固有IDがリポジトリ上に露出し、攻撃者のターゲティング情報になり得る。

**対応:**
```ts
// 環境変数から動的に取得する
hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
```

なお `NEXT_PUBLIC_` プレフィックスの変数はブラウザにも公開される設計だが、gitへの静的コミットは避けるべき。

---

### [MEDIUM] `picsum.photos` が本番設定に残存

**ファイル:** `frontend/next.config.ts:14`

```ts
{ protocol: 'https', hostname: 'picsum.photos' },
```

開発用プレースホルダー画像のホストが本番用configに残っている。参照元: `app/artist/page.tsx:19`。

**対応:** 本番リリース前に `picsum.photos` のエントリを削除し、`artist/page.tsx` の画像を実際のアセットに置き換える。

---

### [MEDIUM] セキュリティヘッダー未設定

**ファイル:** `frontend/next.config.ts`（追加が必要）

以下のHTTPセキュリティヘッダーが未設定:

| ヘッダー | 目的 |
|---------|------|
| `Content-Security-Policy` | インラインスクリプト・外部リソースの制限によるXSS緩和 |
| `X-Frame-Options: DENY` | クリックジャッキング防止 |
| `X-Content-Type-Options: nosniff` | MIMEスニッフィング防止 |
| `Referrer-Policy: strict-origin-when-cross-origin` | リファラー情報の漏洩制御 |

**対応例:**
```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  // ...
}
```

CSPはSupabaseのURL・フォント・画像ソースを考慮して個別に設計する。

---

### [LOW] 検索クエリに最大長バリデーションなし

**ファイル:** `frontend/app/works/page.tsx:15`

```ts
const query = typeof params.q === 'string' ? params.q : undefined
```

URLパラメータ `q` に長さ制限がなく、極端に長いクエリがSupabaseに渡る可能性がある。SQLインジェクションはSupabaseの内部処理で防御済みだが、パフォーマンスリスクがある。

**対応:**
```ts
const raw = typeof params.q === 'string' ? params.q : ''
const query = raw.slice(0, 200) || undefined  // 200文字上限
```

---

### [LOW] ページ番号の上限バリデーションなし

**ファイル:** `frontend/components/works/WorkList.tsx:45`

```ts
const validPage = Number.isInteger(page) && page > 0 ? page : 1
```

`?page=9999999` のような巨大な値が通過し、SupabaseクエリのOFFSETが大きくなる。実際の返却データはゼロだが、上限を設けることが望ましい。

**対応:**
```ts
const MAX_PAGE = 1000
const validPage = Number.isInteger(page) && page > 0 && page <= MAX_PAGE ? page : 1
```

---

### [INFO] `@ts-expect-error` による型安全の迂回

**ファイル:** `frontend/components/works/WorkList.tsx:28,33`

```ts
// @ts-expect-error - Supabaseクエリビルダーの型
result = result.ilike('title', `%${searchText}%`)
```

直接の脆弱性ではないが、型チェックのバイパスは将来的な型ミスによるバグの温床になる可能性がある。SupabaseのTypeScript型定義を正しく活用し、型アサーションを解消することが望ましい。

---

## 既存の良好な実装（変更不要）

| 項目 | 実装場所 | 内容 |
|------|---------|------|
| SSRF対策 | `lib/image-utils.ts:32` | ブラー生成前にホスト名をSupabaseドメインと照合 |
| パストラバーサル対策 | `lib/image-utils.ts:20` | `..` を含むパスをフォールバックに置換 |
| SQLインジェクション対策 | `components/works/WorkList.tsx` | Supabaseのparameterized queryを使用 |
| XSS対策 | 全JSXレンダリング箇所 | Reactが自動エスケープ（`dangerouslySetInnerHTML` 未使用） |
| RLS設定 | Supabase DB側 | `status = true` の作品のみ匿名アクセス可能 |
| `.env` のgit除外 | `.gitignore` | `.env*` が適切に除外されており認証情報漏洩なし |

---

## 対応状況（2026-02-21 対応完了）

| # | 内容 | 状態 |
|---|------|------|
| 1 | Supabaseホスト名を環境変数参照に変更 (`next.config.ts`) | ✅ 完了 |
| 2 | `picsum.photos` を削除・`artist/page.tsx` を `/main.jpg` に差し替え | ✅ 完了 |
| 3 | セキュリティヘッダー追加（`next.config.ts`） | ✅ 完了 |
| 4 | 検索クエリ最大200文字制限 (`app/works/page.tsx`) | ✅ 完了 |
| 5 | ページ番号上限1000設定 (`components/works/WorkList.tsx`) | ✅ 完了 |
| 6 | `@ts-expect-error` の解消 | 未対応（型定義整備が必要、機能上の問題はなし） |

### 残課題
- **CSP (Content-Security-Policy)**: Next.js App Router はハイドレーションに inline script を使用するため、nonce ベースの実装が必要。別途設計・テストが必要。
- **アーティスト写真**: `/main.jpg` は仮置き。実際の写真素材が用意され次第差し替える。
