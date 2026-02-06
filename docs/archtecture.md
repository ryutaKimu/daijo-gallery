# フロントエンド設計方針（Next.js App Router）

## 1. 採用技術

- Framework: Next.js (App Router)
- 言語: TypeScript
- スタイル: CSS / Tailwind（併用）
- API: Go（外部API）

---

## 2. 基本設計思想

- Server Component を基本とする
- Client Component は最小限に抑える
- 「表示」と「動き」を分離する
- データ取得ロジックはUIから分離する

---

## 3. ディレクトリ構成

```txt
app/
├ layout.tsx        # 全体レイアウト（Server）
├ page.tsx          # トップページ（Server）
├ works/
│   ├ page.tsx      # 作品一覧（Server）
│   ├ [id]/page.tsx # 作品詳細（Server）
│   ├ loading.tsx
│   └ error.tsx
├ globals.css

components/
├ works/
│   ├ WorkList.tsx  # 表示用（Server）
│   ├ Gallery.tsx   # インタラクション（Client）
│   └ Modal.tsx     # Client
├ ui/
│   └ Button.tsx
└ layout/
    ├ Header.tsx
    └ Footer.tsx

lib/
└ works.ts          # API通信（Server）

types/
└ work.ts           # 型定義
