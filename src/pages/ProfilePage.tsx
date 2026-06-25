import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Heart,
  Calendar,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Info,
  LogOut,
  Link2,
  Copy,
} from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { formatFullDate } from '../lib/dates'

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

const ORDERS_KEY = 'demo_orders'

interface DemoOrder {
  id: string
  itemId: string
  itemName: string
  itemEmoji: string
  price: number
  quantity: number
  status: 'pending' | 'accepted' | 'done' | 'cancelled'
  from: string
  to: string
  createdAt: string
}

function loadOrders(): DemoOrder[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function getOrderStats(currentUserId: string) {
  const orders = loadOrders()
  const totalSent = orders.filter((o) => o.from === currentUserId).length
  const totalDone = orders.filter(
    (o) =>
      (o.from === currentUserId || o.to === currentUserId) &&
      o.status === 'done',
  ).length
  const totalPending = orders.filter(
    (o) => o.to === currentUserId && o.status === 'pending',
  ).length
  return { totalSent, totalDone, totalPending }
}

/* ──────────────────────────────────────────────────
   ProfilePage — 我的
   ────────────────────────────────────────────────── */

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, couple, partner } = useCoupleStore()
  const { addToast } = useUIStore()

  const currentUserId = profile?.id || 'demo-user-1'
  const stats = getOrderStats(currentUserId)
  const isDemo = localStorage.getItem('demo_mode') === 'true'

  const [editSection, setEditSection] = useState<string | null>(null)

  /* ── Computed ── */

  const displayName = profile?.display_name || '小可爱'
  const partnerDisplayName = partner?.display_name || 'TA'
  const coupleName = couple?.name || '未命名'

  const anniversaryDisplay = couple?.anniversary
    ? formatFullDate(couple.anniversary)
    : '未设置'

  const daysUntilAnniversary = (() => {
    if (!couple?.anniversary) return null
    const target = new Date(couple.anniversary)
    const today = new Date()
    const next = new Date(
      today.getFullYear(),
      target.getMonth(),
      target.getDate(),
    )
    if (next <= today) next.setFullYear(next.getFullYear() + 1)
    return Math.ceil(
      (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    )
  })()

  /* ── Actions ── */

  const handleCopyCode = useCallback(() => {
    const code =
      useCoupleStore.getState().couple?.couple_code ||
      localStorage.getItem('demo_couple_code') ||
      ''
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        addToast('配对码已复制 ✦', 'success')
      })
    } else {
      addToast('暂无配对码', 'info')
    }
  }, [addToast])

  const handleLogout = useCallback(() => {
    if (isDemo) {
      localStorage.removeItem('demo_mode')
      localStorage.removeItem('demo_user')
      localStorage.removeItem('demo_profile')
      localStorage.removeItem('demo_couple')
      localStorage.removeItem('demo_partner')
      localStorage.removeItem('demo_couple_code')
      localStorage.removeItem('demo_photos')
    }
    window.location.href = '/login'
  }, [isDemo])

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-4 py-4 pb-24">
        {/* ═══ Profile Header ═══ */}
        <div
          className="px-4 pt-8 pb-6"
          style={{
            background:
              'linear-gradient(180deg, #FFB8CD 0%, #FFD6E0 50%, #FFF0F4 100%)',
          }}
        >
          <div className="flex flex-col items-center">
            {/* Avatar circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-3"
              style={{
                background:
                  'linear-gradient(135deg, #FF7B9C, #C084FC, #FFD700)',
                boxShadow: '0 6px 24px rgba(255,123,156,0.35)',
                border: '3px solid rgba(255,255,255,0.6)',
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {displayName.charAt(0)}
                </span>
              )}
            </motion.div>

            {/* Name */}
            <h1
              className="crystal-text-sm text-xl mb-1"
              style={{ color: 'var(--color-text)' }}
            >
              {displayName}
            </h1>

            {/* Partner info */}
            {partner && (
              <p className="text-sm text-[var(--color-text-soft)] mt-2 flex items-center gap-1">
                <Heart
                  size={12}
                  style={{ color: 'var(--color-heart)' }}
                  fill="var(--color-heart)"
                />
                与 {partnerDisplayName} 已连接
              </p>
            )}
          </div>
        </div>

        {/* ═══ Stats Row ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 -mt-2 relative z-10"
        >
          <div className="food-card p-4 grid grid-cols-3 divide-x divide-[rgba(255,123,156,0.08)] overflow-hidden">
            {[
              {
                label: '总下单',
                value: stats.totalSent,
                icon: ShoppingBag,
                color: '#FF7B9C',
              },
              {
                label: '已完成',
                value: stats.totalDone,
                icon: CheckCircle2,
                color: '#52C41A',
              },
              {
                label: '待处理',
                value: stats.totalPending,
                icon: Clock,
                color: '#FA8C16',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 px-2"
              >
                <stat.icon size={16} style={{ color: stat.color }} />
                <span
                  className="text-lg font-bold"
                  style={{
                    color: stat.color,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {stat.value}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ═══ Menu Sections ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mt-4 space-y-3"
        >
          {/* 情侣信息 */}
          <div className="food-card overflow-hidden">
            <button
              onClick={() =>
                setEditSection(
                  editSection === 'couple' ? null : 'couple',
                )
              }
              className="w-full p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,123,156,0.1)' }}
                >
                  <Heart
                    size={20}
                    style={{ color: 'var(--color-heart)' }}
                    fill="var(--color-heart)"
                  />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    情侣信息
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 break-word">
                    {coupleName} · {anniversaryDisplay}
                  </p>
                </div>
              </div>
              <motion.div
                animate={{
                  rotate: editSection === 'couple' ? 90 : 0,
                }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 ml-2"
              >
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </motion.div>
            </button>

            {editSection === 'couple' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 space-y-3 border-t border-[rgba(255,123,156,0.06)] pt-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    情侣名
                  </span>
                  <span className="text-sm text-[var(--color-text)] line-clamp-1 break-word max-w-[180px]">
                    {coupleName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    你的昵称
                  </span>
                  <span className="text-sm text-[var(--color-text)]">
                    {displayName}
                  </span>
                </div>
                {partner && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      TA的昵称
                    </span>
                    <span className="text-sm text-[var(--color-text)]">
                      {partnerDisplayName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    纪念日
                  </span>
                  <span className="text-sm text-[var(--color-text)]">
                    {anniversaryDisplay}
                  </span>
                </div>
                {daysUntilAnniversary !== null && daysUntilAnniversary > 0 && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'rgba(255,169,64,0.06)' }}
                  >
                    <Calendar size={14} style={{ color: '#FFA940' }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#FFA940' }}
                    >
                      距离纪念日还有 {daysUntilAnniversary} 天
                    </span>
                  </div>
                )}
                {daysUntilAnniversary === 0 && (
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl"
                    style={{ background: 'rgba(255,215,0,0.06)' }}
                  >
                    <Calendar size={14} style={{ color: '#FFD700' }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#FFA940' }}
                    >
                      今天就是纪念日！
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* 配对码 */}
          <div className="food-card overflow-hidden">
            <button
              onClick={() =>
                setEditSection(
                  editSection === 'code' ? null : 'code',
                )
              }
              className="w-full p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(192,132,252,0.1)' }}
                >
                  <Link2 size={20} style={{ color: '#C084FC' }} />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    配对码
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 break-word">
                    分享给TA，一起恋爱外卖
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: editSection === 'code' ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 ml-2"
              >
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </motion.div>
            </button>

            {editSection === 'code' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 space-y-3 border-t border-[rgba(255,123,156,0.06)] pt-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="text-lg font-bold font-mono tracking-wider break-all"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {useCoupleStore.getState().couple?.couple_code ||
                      localStorage.getItem('demo_couple_code') ||
                      '----'}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(255,123,156,0.25)',
                    }}
                  >
                    <Copy size={12} />
                    复制
                  </motion.button>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  让TA在配对页面输入此码，即可连接你们的关系
                </p>
              </motion.div>
            )}
          </div>

          {/* 关于 */}
          <div className="food-card overflow-hidden">
            <button
              onClick={() =>
                setEditSection(editSection === 'about' ? null : 'about')
              }
              className="w-full p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(96,165,250,0.1)' }}
                >
                  <Info size={20} style={{ color: '#60A5FA' }} />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">
                    关于
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 break-word">
                    恋爱外卖 v1.0.0
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: editSection === 'about' ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 ml-2"
              >
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </motion.div>
            </button>

            {editSection === 'about' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4 space-y-2 border-t border-[rgba(255,123,156,0.06)] pt-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    版本
                  </span>
                  <span className="text-sm text-[var(--color-text)]">1.0.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-muted)]">
                    名称
                  </span>
                  <span className="text-sm text-[var(--color-text)]">
                    恋爱外卖
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] pt-1 leading-relaxed">
                  为情侣打造的甜蜜外卖平台。在这里下单爱意，让甜蜜准时送达。
                </p>
              </motion.div>
            )}
          </div>

          {/* Orders shortcut */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders')}
            className="food-card p-4 flex items-center justify-between cursor-pointer overflow-hidden w-full"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,169,64,0.1)' }}
              >
                <ShoppingBag size={20} style={{ color: '#FFA940' }} />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  我的订单
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-1 break-word">
                  查看恋爱外卖订单
                </p>
              </div>
            </div>
            <ChevronRight
              size={16}
              style={{ color: 'var(--color-text-muted)' }}
              className="flex-shrink-0"
            />
          </motion.button>

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer mt-6"
            style={{
              background: 'rgba(255,68,112,0.06)',
              border: '1px solid rgba(255,68,112,0.15)',
              color: 'var(--color-heart)',
            }}
          >
            <LogOut size={16} />
            退出登录
          </motion.button>
        </motion.div>

        <div className="h-8" />
      </div>
    </div>
  )
}
