/**
 * アプリケーション全体で使用する共通定数
 */

// 画像のブラープレースホルダー
export const BLUR_DATA_URL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

// ナビゲーションリンク
export const NAV_LINKS = [
  { href: '/', label: 'トップ' },
  { href: '/works', label: '作品一覧' },
  { href: '/artist', label: '作者紹介' },
] as const

// ページネーション設定
export const ITEMS_PER_PAGE = 12

// Supabaseストレージバケット
export const STORAGE_BUCKET = 'gallery-images'

// フォールバック画像
export const FALLBACK_IMAGE = '/fallback-image.jpg'
