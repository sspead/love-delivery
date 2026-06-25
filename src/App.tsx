// ============================================================
// 恋爱外卖 (Love Delivery) — 应用入口 / 路由配置
// 外卖点单风格 · 演示模式自动初始化 · 水晶3D文字
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import CoupleSetupPage from './pages/CoupleSetupPage'
import NotFoundPage from './pages/NotFoundPage'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import { MENU_ITEMS } from './config/menu'
import { useCoupleStore } from './stores/coupleStore'

// ============================================================
// 类型定义
// ============================================================

export interface UserProfile {
  id: string
  displayName: string
  emoji: string
  partnerId?: string
  coupleCode?: string
  onboardingComplete: boolean
}

export interface AppUser {
  uid: string
  email: string | null
  isDemo: boolean
  profile: UserProfile | null
}

interface AuthState {
  user: AppUser | null
  loading: boolean
  demoLogin: () => Promise<void>
  emailLogin: (email: string) => Promise<void>
  updateProfile: (profile: Partial<UserProfile>) => void
  logout: () => void
}

// ============================================================
// 演示模式数据
// ============================================================

const DEMO_USER: AppUser = {
  uid: 'demo-user-001',
  email: 'demo@lovedelivery.app',
  isDemo: true,
  profile: {
    id: 'demo-user-001',
    displayName: '小甜心',
    emoji: '🐰',
    partnerId: 'demo-user-002',
    coupleCode: 'LOVE26',
    onboardingComplete: true,
  },
}

const STORAGE_KEY = 'love_delivery_user'

// ============================================================
// Auth Context
// ============================================================

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  demoLogin: async () => {},
  emailLogin: async () => {},
  updateProfile: () => {},
  logout: () => {},
})

export function useAuth(): AuthState {
  return useContext(AuthContext)
}

function useAuthState(): AuthState {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // 初始化：从 localStorage 恢复会话
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AppUser
        setUser(parsed)
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const persist = useCallback((u: AppUser) => {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }, [])

  const demoLogin = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 600))
    persist(DEMO_USER)
  }, [persist])

  const emailLogin = useCallback(
    async (email: string) => {
      await new Promise((r) => setTimeout(r, 800))
      const newUser: AppUser = {
        uid: `user-${Date.now()}`,
        email,
        isDemo: false,
        profile: {
          id: `user-${Date.now()}`,
          displayName: email.split('@')[0],
          emoji: '💗',
          onboardingComplete: false,
        },
      }
      persist(newUser)
    },
    [persist],
  )

  const updateProfile = useCallback((partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev || !prev.profile) return prev
      const updated: AppUser = {
        ...prev,
        profile: { ...prev.profile, ...partial },
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { user, loading, demoLogin, emailLogin, updateProfile, logout }
}

// ============================================================
// AuthGuard — 路由保护
// ============================================================

function AuthGuard() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F4] flex items-center justify-center">
        <div className="animate-pulse-glow text-4xl select-none">💗</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (
    user.profile &&
    !user.profile.onboardingComplete &&
    !location.pathname.startsWith('/onboarding') &&
    !location.pathname.startsWith('/join')
  ) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

// ============================================================
// 菜单数据同步：确保 demo 模式下 localStorage 有菜单
// ============================================================

function initDemoMenu() {
  if (!localStorage.getItem('love_delivery_menu')) {
    localStorage.setItem('love_delivery_menu', JSON.stringify(MENU_ITEMS))
  }
}

// ============================================================
// AppRouter
// ============================================================

function AppRouter() {
  return (
    <Routes>
      {/* 公共路由 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/join/:code?" element={<CoupleSetupPage />} />

      {/* 受保护路由 — AppShell 作为外卖风格布局 */}
      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="category/:id" element={<CategoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// ============================================================
// 顶层 App 组件
// ============================================================

export default function App() {
  const auth = useAuthState()

  // 初始化演示菜单数据 + Zustand coupleStore 演示数据
  useEffect(() => {
    initDemoMenu()

    // 为 Zustand coupleStore 填充演示数据（兼容现有页面）
    const store = useCoupleStore.getState()
    if (!store.profile) {
      store.setProfile({
        id: 'demo-user-001',
        display_name: '小甜心',
        avatar_url: null,
      })
    }
    if (!store.couple) {
      store.setCouple({
        id: 'demo-couple-001',
        couple_code: 'LOVE26',
        name: '甜蜜恋人',
        anniversary: null,
        user1_id: 'demo-user-001',
        user2_id: 'demo-user-002',
        partner: null,
      })
    }
    if (!store.partner) {
      store.setPartner({
        id: 'demo-user-002',
        display_name: '小可爱',
        avatar_url: null,
      })
    }
    store.setLoading(false)

    // 同时写入 localStorage（兼容旧代码路径）
    localStorage.setItem('demo_mode', 'true')
  }, [])

  return (
    <AuthContext.Provider value={auth}>
      <HashRouter>
        <AppRouter />
      </HashRouter>
    </AuthContext.Provider>
  )
}
