// ============================================================
// 恋爱外卖 BottomNav — 外卖风格底部导航
// 4个Tab：首页 / 订单 / 消息 / 我的
// ============================================================
import { useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ClipboardList, MessageCircle, User } from 'lucide-react'

// ============================================================
// Tab 定义
// ============================================================

interface NavTab {
  path: string
  label: string
  Icon: typeof Home
}

const tabs: NavTab[] = [
  { path: '/', label: '首页', Icon: Home },
  { path: '/orders', label: '订单', Icon: ClipboardList },
  { path: '/messages', label: '消息', Icon: MessageCircle },
  { path: '/profile', label: '我的', Icon: User },
]

// ============================================================
// Helpers
// ============================================================

function getPendingCount(): number {
  try {
    const orders = JSON.parse(localStorage.getItem('demo_orders') || '[]')
    return orders.filter((o: any) => o.status === 'pending').length
  } catch {
    return 0
  }
}

// ============================================================
// BottomNav 组件
// ============================================================

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname

  const isActive = useCallback(
    (tab: NavTab) => {
      if (tab.path === '/') return currentPath === '/'
      return currentPath.startsWith(tab.path)
    },
    [currentPath],
  )

  const pendingCount = useMemo(() => getPendingCount(), [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 safe-bottom">
      {/* 顶部分割线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#FFB8CD] to-transparent" />

      {/* Tab 栏 */}
      <div className="bg-white flex items-center justify-around h-14 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
        {tabs.map((tab) => {
          const active = isActive(tab)
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 cursor-pointer select-none"
            >
              {/* 激活态顶部指示条 */}
              {active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                />
              )}

              {/* 图标 */}
              <tab.Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  transition: 'color 0.2s ease',
                }}
              />

              {/* 标签文字 */}
              <span
                className="text-[10px] leading-tight"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: active ? 600 : 500,
                  transition: 'color 0.2s ease',
                }}
              >
                {tab.label}
              </span>

              {/* 订单Tab角标 */}
              {tab.path === '/orders' && pendingCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute top-1 right-1/4 min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1"
                  style={{
                    background: 'var(--color-heart)',
                    boxShadow: '0 0 6px rgba(255,68,112,0.4)',
                  }}
                >
                  <span className="text-[9px] font-bold text-white leading-none">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
