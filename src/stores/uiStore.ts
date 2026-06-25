import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'love'
}

interface UIState {
  theme: 'light' | 'pink'
  toasts: Toast[]
  showCreatePost: boolean
  setTheme: (theme: 'light' | 'pink') => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  setShowCreatePost: (show: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'pink',
  toasts: [],
  showCreatePost: false,
  setTheme: (theme) => {
    set({ theme })
    document.documentElement.setAttribute('data-theme', theme)
  },
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setShowCreatePost: (show) => set({ showCreatePost: show }),
}))
