# 山田大乗 Gallery Site 設計

## 1. 目的
- 作品のオンライン提示
- 管理画面により、写真、文言の修正


## 2. 想定ユーザー

 ### 一般ユーザー
  - 作品閲覧者

 ### 管理者

  - 本人(?) あるいは代理管理者


## 3. 技術スタック
 - Next.js (App Router)
 - TypeScript
 - Supabase（Database / Auth / Storage）
 - PostgreSQL（Supabase提供）
 - デプロイ: Vercel

## 4. システム構成
 - サーバーレス構成（Supabase BaaS + Vercel）
 - フロントエンドから Supabase クライアントで直接データ取得
 - 画像は Supabase Storage で管理
 - Server Component からのデータ取得を基本とする

## 5. 認証方針
 - Supabase Auth を使用
 - 管理画面のみ認証を行う
 - メール / パスワード認証

## 6. 開発方針
- 設計書をdoc/で管理。　md/mmdで管理する。
- 最小限のサイクルを繰り返して、開発
