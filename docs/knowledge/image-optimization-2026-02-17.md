# 画像最適化の強化 — 実装記録

**実施日:** 2026-02-17

## 背景

`implementation-improvements-2025-02-16.md` の中優先度改善項目として記載されていた内容を実装。

## 実施内容

### 1. plaiceholder 導入（コンテンツに応じたブラープレースホルダー）

**Before:** 全コンポーネントで 1×1 透明GIF を共用
```typescript
placeholder="blur"
blurDataURL={BLUR_DATA_URL}  // 'data:image/gif;base64,...'
```

**After:** 各画像のコンテンツから動的にブラーを生成
```typescript
placeholder="blur"
blurDataURL={work.blurDataURL}  // plaiceholder が生成した base64
```

#### 実装方法

`frontend/lib/image-utils.ts` を新規作成し、2つのユーティリティを提供:

```typescript
// 1. URL構築（getPublicUrl() のループ呼び出しを廃止）
export function buildImageUrl(imgPath: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${imgPath}`
}

// 2. plaiceholder でブラー生成（失敗時は従来の GIF にフォールバック）
export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl)
    const buffer = Buffer.from(await res.arrayBuffer())
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch (err) {
    console.error('getBlurDataUrl: failed to generate blur placeholder', imageUrl, err)
    return BLUR_DATA_URL
  }
}
```

データ取得関数内で `Promise.all` を使い画像を並列処理:
```typescript
const works = await Promise.all(
  worksData.map(async (work) => {
    const imageUrl = buildImageUrl(work.img_path)
    const blurDataURL = await getBlurDataUrl(imageUrl)
    return { ...work, imageUrl, blurDataURL }
  }),
)
```

#### キャッシュとの関係

すべての fetch 関数は `unstable_cache`（revalidate: 60s）でラップ済みのため、
plaiceholder の画像 fetch はキャッシュ期間中は再実行されない。パフォーマンス上の問題なし。

### 2. URL 構築の最適化

`getPublicUrl()` は Supabase SDK 内でURLを構築するだけでネットワーク通信は発生しないが、
ループ内で SDK メソッドを呼ぶのは可読性・明示性に欠けていた。

`buildImageUrl()` で環境変数から直接構築することで、URL の構造が一目で分かるようになった。

### 3. 関連作品クエリの最適化

**Before:**
```typescript
// JS 側で Set による重複排除
const uniqueIds = [...new Set(relatedIds.map((r) => r.work_id))]
```

**After:**
```typescript
// SQL の IN 句は重複値を自動無視するため Set は不要
const ids = relatedIds.map((r) => r.work_id)
```

合わせて最初のクエリに `.limit(20)` を追加し、取得件数に上限を設けた。

## 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `frontend/lib/image-utils.ts` | 新規作成（buildImageUrl / getBlurDataUrl） |
| `frontend/types/work.ts` | Work / WorkDetail / RelatedWork に `blurDataURL: string` 追加 |
| `frontend/components/works/WorkList.tsx` | image-utils へ移行、async Promise.all で blur 生成 |
| `frontend/components/works/FeaturedGallery.tsx` | 同上 |
| `frontend/app/works/[id]/page.tsx` | 同上 + クエリ最適化 |

## インストールパッケージ

```bash
npm install plaiceholder sharp
# plaiceholder@3.0.0, sharp@0.34.5
```

## API（plaiceholder v3）

```typescript
import { getPlaiceholder } from 'plaiceholder'

const buffer = Buffer.from(await fetch(url).then(r => r.arrayBuffer()))
const { base64 } = await getPlaiceholder(buffer)
// base64 → data:image/png;base64,... 形式の文字列
```

## セキュリティ修正（2026-02-17）

### SSRF（Server-Side Request Forgery）対策

#### 指摘内容

`img_path` はDBから取得した値をそのまま `buildImageUrl()` に渡し、`fetch()` を実行していた。
攻撃者が DB 内の `img_path` を操作できる場合、サーバーを踏み台に任意ホストへリクエストを送らせる
SSRF 攻撃が成立する可能性があった。

**攻撃例:**
- `img_path = "../../secret"` — パストラバーサルによる予期しないパスへのアクセス
- `img_path = "%40evil.com/path"` — URL パーシングの挙動を悪用した別ホストへの誘導

#### 修正内容

**1. `buildImageUrl` — `img_path` のフォーマット検証**

```typescript
// 英数字・ハイフン・アンダースコア・スラッシュ・ドットのみ許可
const SAFE_IMG_PATH_RE = /^[\w\-.\/]+$/

export function buildImageUrl(imgPath: string): string {
  if (!imgPath) return FALLBACK_IMAGE
  // パストラバーサル（..）または不正文字を含む場合はフォールバック
  if (!SAFE_IMG_PATH_RE.test(imgPath) || imgPath.includes('..')) {
    return FALLBACK_IMAGE
  }
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${imgPath}`
}
```

**2. `getBlurDataUrl` — fetch 前のホスト名許可リストチェック**

```typescript
const allowedHostname = new URL(supabaseUrl).hostname

export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    const parsed = new URL(imageUrl)
    if (parsed.hostname !== allowedHostname) {
      console.warn('getBlurDataUrl: blocked request to disallowed host', parsed.hostname)
      return BLUR_DATA_URL
    }
    const res = await fetch(imageUrl)
    const buffer = Buffer.from(await res.arrayBuffer())
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch (err) {
    console.error('getBlurDataUrl: failed to generate blur placeholder', imageUrl, err)
    return BLUR_DATA_URL
  }
}
```

#### 多層防御の考え方

| レイヤー | 対策 |
|---|---|
| 入力値（`img_path`） | 正規表現 + `..` チェックでパストラバーサルをブロック |
| fetch 直前 | ホスト名の許可リストで外部ホストへのリクエストをブロック |
| Next.js Image | `next.config.ts` の `remotePatterns` で Supabase ドメインのみ許可（既存） |

## セキュリティスキャナーの誤検知について（初回: 2026-02-17 / 再発報告: 2026-02-17）

### 報告内容（繰り返し報告されている）

> "The imageUrl is constructed from work.img_path (retrieved from the database), and then getBlurDataUrl performs a fetch request to this imageUrl. If an attacker can control the img_path stored in the database, it leads to SSRF."
> — `page.tsx:58` (および FeaturedGallery.tsx:53, WorkList.tsx:93 も同様のフラグ)

同一の報告が再度届いた（2026-02-17）。**対応は不要**。以下の根拠を参照。

### 判断: フォールスポジティブ

静的解析スキャナーは「DB値 → fetch()」のトレースのみで検出しており、
`buildImageUrl` / `getBlurDataUrl` の内部実装（ホスト名許可リスト・正規表現バリデーション）を追っていないため誤検知となっている。

実際の保護は `image-utils.ts` 内の2層防御で完結しており、追加対応は不要。

### 根拠

| スキャナーが見るフロー | 実際のフロー |
|---|---|
| `img_path` → `buildImageUrl()` → `getBlurDataUrl()` → `fetch()` | `img_path` → **[正規表現バリデーション]** → **[ホスト名チェック]** → `fetch()` |

---

## 教訓

- `SQL の IN` は重複値を自動で無視するため、JS 側での `Set` 重複排除は原則不要
- plaiceholder の処理は `unstable_cache` と組み合わせることでパフォーマンスへの影響を最小化できる
- `getPublicUrl()` はネットワーク通信なしのURL構築のみだが、ループ内で呼ぶより環境変数から直接構築する方が明示的
- DBから取得した文字列を URL の一部として使う場合、`fetch()` 前に必ずホスト名のホワイトリストチェックを行う（SSRF対策）
- `img_path` のような外部入力由来のパス文字列は、正規表現でフォーマット制限 + `..` 禁止を徹底する
