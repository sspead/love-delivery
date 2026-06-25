import { create } from 'zustand'
import { supabase } from '../config/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: boolean
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: false,
  loading: true,
  setUser: (user) => set({ user, session: !!user }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: false })
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ user: session?.user ?? null, session: !!session, loading: false })
    } catch {
      set({ user: null, session: false, loading: false })
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, session: !!session })
    })
  },
}))
