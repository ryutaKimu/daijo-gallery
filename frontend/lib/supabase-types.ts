import type { PostgrestError } from '@supabase/postgrest-js'

/**
 * Supabaseクエリの標準的なレスポンス型
 * 単一レコード、配列、どちらにも対応可能
 */
export type SupabaseResponse<T> = {
  data: T | null
  error: PostgrestError | null
}

/**
 * 配列データのレスポンス型（型の明示性向上のため）
 */
export type SupabaseArrayResponse<T> = {
  data: T[] | null
  error: PostgrestError | null
}
