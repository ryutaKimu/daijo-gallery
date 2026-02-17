import { getPlaiceholder } from 'plaiceholder'
import { STORAGE_BUCKET, BLUR_DATA_URL, FALLBACK_IMAGE } from './constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// 許可するホスト名（Supabaseのホスト名）
const allowedHostname = new URL(supabaseUrl).hostname

// img_path の安全なパターン: 英数字・ハイフン・アンダースコア・スラッシュ・ドットのみ許可
// パストラバーサル（..）や任意プロトコル挿入を防ぐ
const SAFE_IMG_PATH_RE = /^[\w\-.\/]+$/

// 環境変数からURL直接構築（getPublicUrl()のループ呼び出しを廃止）
export function buildImageUrl(imgPath: string): string {
  if (!imgPath) return FALLBACK_IMAGE
  // パストラバーサル・不正文字を含む場合はフォールバック
  if (!SAFE_IMG_PATH_RE.test(imgPath) || imgPath.includes('..')) {
    return FALLBACK_IMAGE
  }
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${imgPath}`
}

// plaiceholder でコンテンツに応じたブラーを生成（失敗時は BLUR_DATA_URL にフォールバック）
// SSRF対策: fetchする前にホスト名が許可済みSupabaseドメインであることを検証
export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    // URLパース失敗 or 許可外ホストへのリクエストをブロック
    const parsed = new URL(imageUrl)
    if (parsed.hostname !== allowedHostname) {
      console.warn('getBlurDataUrl: blocked request to disallowed host', parsed.hostname)
      return BLUR_DATA_URL
    }
    const res = await fetch(imageUrl)
    if (!res.ok) return BLUR_DATA_URL
    const buffer = Buffer.from(await res.arrayBuffer())
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch {
    return BLUR_DATA_URL
  }
}
