# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Lifetime Canvasは、Next.js 16（App Router）+ Supabaseで構築された日本語のアートギャラリーサイト。和風テイストの上品なデザインで、高齢者（70代以上）を対象にアート作品を展示する。フロントエンドは `frontend/` ディレクトリに格納。

## コマンド

すべて `frontend/` ディレクトリで実行:

```bash
cd frontend
npm run dev      # 開発サーバー（localhost:3000）
npm run build    # 本番ビルド
npm run lint     # ESLint実行
```

## アーキテクチャ

### サーバーファーストパターン
- **Server Componentsがデフォルト** — データ取得はすべてサーバー側
- **Client Components（`'use client'`）** はインタラクティブな要素のみ（TextSearch, TagSearch, Pagination）
- **APIルートは未使用** — SupabaseをServer Componentsから直接クエリ
- フィルタリング・ページネーションの状態管理はReact stateではなくURLの`searchParams`を使用

### データ取得
- Supabaseクライアントは `frontend/lib/superbase.ts` で初期化（ファイル名は"superbase"）
- `unstable_cache()` を使用し、60秒のrevalidationとキャッシュタグを設定
- Supabaseは `{ data, error }` を返す — dataを使う前に必ずerrorをチェック
- 画像パスはDBに相対パスで保存（例: `works/1.jpg`）、`getPublicUrl()` でフルURL構築

### データベース（Supabase）
- **works** — 作品テーブル（`status`でpublished/draftを管理）
- **tags** — タグ定義
- **works_tags** — 中間テーブル（多対多）
- **work_images** — 作品の制作過程・関連画像
- **RLSを適用**: 匿名ユーザーは `status = true` のみ閲覧可能、認証済み管理者はフルCRUD
- ストレージバケット: `gallery-images`（公開、最大5MB、jpeg/png/webp対応）

### スタイリング
- Tailwind CSS v4（`@tailwindcss/postcss`使用）
- `globals.css` にCSS変数でカラーパレットを定義:
  - `--color-main: #5A3A22`（濃茶）, `--color-sub: #F5EFE6`（生成り）, `--color-bg: #FBF7F2`（薄ベージュ）, `--color-accent: #6B7B6A`（深緑）
- フォント: Noto Serif JP（本文）, Playfair Display（見出し） — `next/font/google`で読み込み
- パスエイリアス: `@/*` → `frontend/*`

### ディレクトリ構成
- `frontend/app/` — App Routerのページ（`/`, `/works`, `/artist`）
- `frontend/components/` — `layout/`, `ui/`, `works/` で分類
- `frontend/lib/` — SupabaseクライアントとDB型定義
- `frontend/types/` — TypeScriptインターフェース（Work, Tag）
- `docs/` — プロジェクトドキュメント（アーキテクチャ、DBスキーマ、デザイン仕様、APIパターン）

## コードスタイル
- Prettier: セミコロンなし、シングルクォート、トレイリングカンマ（es5）、100文字幅
- TypeScript strictモード有効
- 画像は必ずNext.jsの`Image`コンポーネントを`sizes`プロップ付きで使用
- コミットメッセージは日本語

## お願い
コードレビューを適宜行い、
可読性　パフォーマンス改善
効率の良いコード　設計
バグ混在可能性

こういった観点からの指摘とその対応を
ドキュメント化しておきたいです。
doc/knowledge/
のようなディレクトリを作成し、
レビュー後に蓄積していく