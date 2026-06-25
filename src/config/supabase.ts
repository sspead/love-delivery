import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseUrl !== '' && supabaseAnonKey && supabaseAnonKey !== '')
}

// Lazy-initialized supabase client — only created when configured
let _client: SupabaseClient<Database> | null = null

function getClient(): SupabaseClient<Database> {
  if (!_client && isSupabaseConfigured()) {
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  }
  if (!_client) {
    throw new Error('Supabase is not configured. Use demo mode instead.')
  }
  return _client
}

// Proxy that throws informative errors when not configured
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = isSupabaseConfigured() ? getClient() : null
    if (!client) {
      // Return safe no-ops for methods commonly called at init
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          signInWithOtp: async () => { throw new Error('Supabase 未配置，请使用演示模式') },
          signOut: async () => {},
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        }
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({ data: [], error: null }),
          insert: () => { throw new Error('Supabase 未配置，请使用演示模式') },
          update: () => { throw new Error('Supabase 未配置，请使用演示模式') },
          delete: () => { throw new Error('Supabase 未配置，请使用演示模式') },
        })
      }
      if (prop === 'storage') {
        return {
          from: () => ({
            upload: () => { throw new Error('Supabase 未配置，请使用演示模式') },
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
          }),
        }
      }
      if (prop === 'channel') {
        return () => ({
          on: () => ({ subscribe: () => {} }),
          subscribe: () => {},
        })
      }
      if (typeof prop === 'string' && prop.startsWith('_')) return undefined
      return undefined
    }
    const value = (client as unknown as Record<string, unknown>)[prop as string]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
