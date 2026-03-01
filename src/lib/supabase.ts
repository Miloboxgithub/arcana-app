import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          username?: string | null
          avatar_url?: string | null
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          slot: 'morning' | 'afternoon' | 'evening'
          exp: number
          dimension: string
          icon: string
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'user_id' | 'created_at'>>
      }
      check_records: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['check_records']['Row'], 'created_at'>
        Update: never
      }
      dimensions: {
        Row: {
          id: string
          user_id: string
          dim_id: string
          exp: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['dimensions']['Row'], 'updated_at'>
        Update: { exp?: number }
      }
    }
  }
}
