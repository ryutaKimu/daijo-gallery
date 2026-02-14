# フロントエンド設計方針（Next.js App Router）

## 1. 採用技術

- Framework: Next.js (App Router)
- 言語: TypeScript
- スタイル: CSS / Tailwind（併用）
- BaaS: Supabase（Database / Auth / Storage）
- デプロイ: Vercel

---

## 2. 基本設計思想

- Server Component を基本とする
- Client Component は最小限に抑える
- 「表示」と「動き」を分離する
- データ取得は Supabase クライアントを通じて行う

---

## 3. ディレクトリ構成

```txt
app/
├ layout.tsx        # 全体レイアウト（Server Component）
├ page.tsx          # トップページ（Server Component）
├ globals.css       # グローバルスタイル
├ works/
│   ├ page.tsx      # 作品一覧（Server Component）
│   ├ [id]/page.tsx # 作品詳細（Server Component）
│   ├ loading.tsx
│   └ error.tsx

components/
├ works/
│   ├ WorkList.tsx  # 表示用（Server Component）
│   ├ Gallery.tsx   # インタラクション（Client Component）
│   └ Modal.tsx     # Client
├ ui/
│   └ Button.tsx    # 表示用 (Server Component)
└ layout/
    ├ Header.tsx    # 表示用 (Server Component)
    └ Footer.tsx    # 表示用 (Server Component)

data/
└ tags.ts           # 共通データ定義

lib/
├ supabase.ts       # Supabase クライアント初期化
└ works.ts          # データ取得関数（Server）

types/
└ work.ts           # 型定義
```

---

## 4. データ取得方針

- Server Component から `lib/supabase.ts` のクライアントを使用してデータ取得
- クライアントサイドでの直接的なDB操作は行わない
- 環境変数で Supabase の接続情報を管理
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 5. 画像管理

- 作品画像は Supabase Storage に保存
- Storage のパブリックバケットを使用し、画像URLを取得
