import { getPlaiceholder } from 'plaiceholder'
import { STORAGE_BUCKET, BLUR_DATA_URL, FALLBACK_IMAGE } from './constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// 環境変数からURL直接構築（getPublicUrl()のループ呼び出しを廃止）
export function buildImageUrl(imgPath: string): string {
  if (!imgPath) return FALLBACK_IMAGE
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${imgPath}`
}

// plaiceholder でコンテンツに応じたブラーを生成（失敗時は BLUR_DATA_URL にフォールバック）
export async function getBlurDataUrl(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return BLUR_DATA_URL
    const buffer = Buffer.from(await res.arrayBuffer())
    const { base64 } = await getPlaiceholder(buffer)
    return base64
  } catch {
    return BLUR_DATA_URL
  }
}
