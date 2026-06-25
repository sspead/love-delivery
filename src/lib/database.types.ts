export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      couples: {
        Row: {
          id: string
          couple_code: string
          name: string
          anniversary: string | null
          created_at: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          id?: string
          couple_code: string
          name?: string
          anniversary?: string | null
          created_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          id?: string
          couple_code?: string
          name?: string
          anniversary?: string | null
          created_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
      }
      timeline_posts: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          content: string | null
          image_urls: string[] | null
          mood: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          content?: string | null
          image_urls?: string[] | null
          mood?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          author_id?: string
          content?: string | null
          image_urls?: string[] | null
          mood?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      check_ins: {
        Row: {
          id: string
          couple_id: string
          user_id: string
          check_date: string
          mood: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          user_id: string
          check_date?: string
          mood?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          user_id?: string
          check_date?: string
          mood?: string | null
          note?: string | null
          created_at?: string
        }
      }
      wishes: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          title: string
          description: string | null
          category: string | null
          is_fulfilled: boolean
          fulfilled_at: string | null
          fulfilled_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          title: string
          description?: string | null
          category?: string | null
          is_fulfilled?: boolean
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          author_id?: string
          title?: string
          description?: string | null
          category?: string | null
          is_fulfilled?: boolean
          fulfilled_at?: string | null
          fulfilled_by?: string | null
          created_at?: string
        }
      }
      love_letters: {
        Row: {
          id: string
          couple_id: string
          author_id: string
          recipient_id: string
          title: string
          content: string
          mood: string | null
          is_opened: boolean
          opened_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          author_id: string
          recipient_id: string
          title: string
          content: string
          mood?: string | null
          is_opened?: boolean
          opened_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          author_id?: string
          recipient_id?: string
          title?: string
          content?: string
          mood?: string | null
          is_opened?: boolean
          opened_at?: string | null
          created_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          couple_id: string
          creator_id: string
          holder_id: string
          title: string
          description: string | null
          icon: string
          expires_at: string | null
          is_redeemed: boolean
          redeemed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          creator_id: string
          holder_id: string
          title: string
          description?: string | null
          icon?: string
          expires_at?: string | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          creator_id?: string
          holder_id?: string
          title?: string
          description?: string | null
          icon?: string
          expires_at?: string | null
          is_redeemed?: boolean
          redeemed_at?: string | null
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          couple_id: string
          uploader_id: string
          storage_path: string
          thumbnail_path: string | null
          caption: string | null
          taken_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          uploader_id: string
          storage_path: string
          thumbnail_path?: string | null
          caption?: string | null
          taken_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          uploader_id?: string
          storage_path?: string
          thumbnail_path?: string | null
          caption?: string | null
          taken_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          couple_id: string
          recipient_id: string
          sender_id: string
          type: string
          title: string
          body: string | null
          resource_id: string | null
          resource_type: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          couple_id: string
          recipient_id: string
          sender_id: string
          type: string
          title: string
          body?: string | null
          resource_id?: string | null
          resource_type?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          couple_id?: string
          recipient_id?: string
          sender_id?: string
          type?: string
          title?: string
          body?: string | null
          resource_id?: string | null
          resource_type?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// App-level types
export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
}

export interface Couple {
  id: string
  couple_code: string
  name: string
  anniversary: string | null
  user1_id: string | null
  user2_id: string | null
  partner?: Profile | null
}

export interface TimelinePost {
  id: string
  couple_id: string
  author_id: string
  content: string | null
  image_urls: string[]
  mood: string | null
  created_at: string
  author?: Profile
}

export interface CheckIn {
  id: string
  couple_id: string
  user_id: string
  check_date: string
  mood: string | null
  note: string | null
}

export interface Wish {
  id: string
  couple_id: string
  author_id: string
  title: string
  description: string | null
  category: string | null
  is_fulfilled: boolean
  fulfilled_at: string | null
  fulfilled_by: string | null
  created_at: string
}

export interface LoveLetter {
  id: string
  couple_id: string
  author_id: string
  recipient_id: string
  title: string
  content: string
  mood: string | null
  is_opened: boolean
  opened_at: string | null
  created_at: string
  author?: Profile
}

export interface Coupon {
  id: string
  couple_id: string
  creator_id: string
  holder_id: string
  title: string
  description: string | null
  icon: string
  expires_at: string | null
  is_redeemed: boolean
  redeemed_at: string | null
  created_at: string
}

export interface Photo {
  id: string
  couple_id: string
  uploader_id: string
  storage_path: string
  thumbnail_path: string | null
  caption: string | null
  taken_at: string | null
  created_at: string
}

export interface AppNotification {
  id: string
  couple_id: string
  recipient_id: string
  sender_id: string
  type: string
  title: string
  body: string | null
  is_read: boolean
  created_at: string
}
