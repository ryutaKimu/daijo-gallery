import { createClient } from '@supabase/supabase-js'

// データベースの型定義
export type Database = {
  public: {
    Tables: {
      works: {
        Row: {
          id: number
          title: string
          description: string | null
          year: string | null
          image_path: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          year?: string | null
          image_path: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          year?: string | null
          image_path?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          tag_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          tag_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          tag_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      works_tags: {
        Row: {
          work_id: number
          tag_id: number
        }
        Insert: {
          work_id: number
          tag_id: number
        }
        Update: {
          work_id?: number
          tag_id?: number
        }
      }
      work_images: {
        Row: {
          id: number
          work_id: number
          type: string
          img_path: string
          sort_order: number
          caption: string | null
          created_at: string
        }
        Insert: {
          id?: number
          work_id: number
          type: string
          img_path: string
          sort_order?: number
          caption?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          work_id?: number
          type?: string
          img_path?: string
          sort_order?: number
          caption?: string | null
          created_at?: string
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
