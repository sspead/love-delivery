import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle2, XCircle, Heart, ShoppingBag, Sparkles } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { Confetti } from '../components/ui/Confetti'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

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

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

const ORDERS_KEY = 'demo_orders'

function loadOrders(): DemoOrder[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveOrders(orders: DemoOrder[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}

/* ──────────────────────────────────────────────────
   Status config
   ────────────────────────────────────────────────── */

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string; className: string }
> = {
  pending: {
    label: '待接单',
    icon: Clock,
    color: '#FA8C16',
    className: 'pending',
  },
  accepted: {
    label: '已接单',
    icon: CheckCircle2,
    color: '#1890FF',
    className: 'accepted',
  },
  done: {
    label: '已完成',
    icon: CheckCircle2,
    color: '#52C41A',
    className: 'done',
  },
  cancelled: {
    label: '已取消',
    icon: XCircle,
    color: '#A090A3',
    className: '',
  },
}

/* ──────────────────────────────────────────────────
   OrdersPage — 订单列表
   ────────────────────────────────────────────────── */

export default function OrdersPage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()

  const currentUserId = profile?.id || 'demo-user-1'
  const partnerName = partner?.display_name || 'TA'

  const [orders, setOrders] = useState<DemoOrder[]>(loadOrders)
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  /* ── Filtered orders ── */

  const sentOrders = orders.filter(
    (o) => o.from === currentUserId && o.status !== 'cancelled',
  )
  const receivedOrders = orders.filter(
    (o) => o.to === currentUserId && o.status !== 'cancelled',
  )
  const displayedOrders =
    activeTab === 'sent' ? sentOrders : receivedOrders

  /* ── Stats ── */

  const totalSent = sentOrders.length
  const totalDone = orders.filter((o) => o.status === 'done').length
  const totalPending = orders.filter((o) => o.status === 'pending').length

  /* ── Actions ── */

  const handleAccept = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'accepted' as const } : o,
        ),
      )
      addToast('已接单！快去完成吧~ 💝', 'love')
    },
    [addToast],
  )

  const handleReject = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' as const } : o,
        ),
      )
      addToast('已婉拒 🙏', 'info')
    },
    [addToast],
  )

  const handleComplete = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'done' as const } : o,
        ),
      )
      setShowConfetti(true)
      addToast('甜蜜送达！💝', 'love')
      setTimeout(() => setShowConfetti(false), 3000)
    },
    [addToast],
  )

  /* ── Order card component ── */

  function OrderCard({ order }: { order: DemoOrder }) {
    const isSent = order.from === currentUserId
    const status = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = status.icon

    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="food-card p-4 overflow-hidden"
      >
        {/* Top row: order number + status */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-mono font-bold tracking-wider px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(255,123,156,0.06)',
              color: 'var(--color-primary)',
            }}
          >
            {order.id}
          </span>
          <span className={`order-badge ${status.className}`}>
            <StatusIcon size={12} />
            {status.label}
          </span>
        </div>

        {/* Item info */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,123,156,0.08), rgba(255,184,205,0.06))',
            }}
          >
            {order.itemEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 break-word">
              {order.itemName}
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              x{order.quantity} · {order.price * order.quantity} 爱点
            </p>
          </div>
        </div>

        {/* Bottom: time + from/to + actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,123,156,0.06)]">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] min-w-0">
            <Clock size={11} className="flex-shrink-0" />
            <span className="flex-shrink-0">{formatTimeAgo(order.createdAt)}</span>
            <span className="flex-shrink-0">·</span>
            <span className="line-clamp-1 break-word">
              {isSent ? (
                <>
                  发给{' '}
                  <span
                    className="font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {partnerName}
                  </span>
                </>
              ) : (
                <>
                  来自{' '}
                  <span
                    className="font-medium"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {partnerName}
                  </span>
                </>
              )}
            </span>
          </div>

          {/* Action buttons (only on received) */}
          {!isSent && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {order.status === 'pending' && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReject(order.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                    style={{
                      background: 'rgba(160,144,163,0.1)',
                      color: 'var(--color-text-muted)',
                      border: '1px solid rgba(160,144,163,0.2)',
                    }}
                  >
                    婉拒
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleAccept(order.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer text-white flex items-center gap-1"
                    style={{
                      background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
                      boxShadow: '0 2px 8px rgba(255,123,156,0.25)',
                    }}
                  >
                    <Heart size={11} />
                    接单
                  </motion.button>
                </>
              )}

              {order.status === 'accepted' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleComplete(order.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer text-white flex items-center gap-1"
                  style={{
                    background: 'linear-gradient(135deg, #52C41A, #73D13D)',
                    boxShadow: '0 2px 8px rgba(82,196,26,0.3)',
                  }}
                >
                  <CheckCircle2 size={11} />
                  标记完成
                </motion.button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-4 py-4 pb-24">
        <Confetti active={showConfetti} duration={3000} />

        {/* ═══ Header ═══ */}
        <div
          className="sticky top-0 z-20 px-4 py-3"
          style={{
            background: 'rgba(255,240,244,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,123,156,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={20} style={{ color: 'var(--color-primary)' }} />
            <h1
              className="crystal-text-sm text-xl"
              style={{ color: 'var(--color-text)' }}
            >
              我的订单
            </h1>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <ShoppingBag size={12} />
              总下单 {totalSent}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} style={{ color: '#52C41A' }} />
              已完成 {totalDone}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} style={{ color: '#FA8C16' }} />
              待处理 {totalPending}
            </span>
          </div>
        </div>

        {/* ═══ Tabs ═══ */}
        <div className="px-4 mt-4">
          <div
            className="flex rounded-2xl p-1"
            style={{ background: 'rgba(255,123,156,0.06)' }}
          >
            {(
              [
                { key: 'sent', label: '发出的单' as const },
                { key: 'received', label: '收到的单' as const },
              ] as const
            ).map((tab) => (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer relative"
                style={{
                  color:
                    activeTab === tab.key ? '#fff' : 'var(--color-text-soft)',
                }}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="orderTabBg"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
                      boxShadow: '0 2px 8px rgba(255,123,156,0.25)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 28,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ═══ Order List ═══ */}
        <div className="px-4 mt-4 space-y-3">
          <AnimatePresence mode="wait">
            {displayedOrders.length === 0 ? (
              <motion.div
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-5xl mb-4"
                >
                  {activeTab === 'sent' ? '💌' : '📬'}
                </motion.span>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
                  {activeTab === 'sent' ? '还没有下过单' : '还没有收到订单'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mb-5 max-w-[240px] leading-relaxed">
                  {activeTab === 'sent'
                    ? '去首页挑选甜蜜商品，为TA下一单吧~'
                    : '等TA为你下单，甜蜜即将送达'}
                </p>
                {activeTab === 'sent' && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = '/')}
                    className="px-5 py-2.5 rounded-full text-white text-sm font-semibold cursor-pointer flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
                      boxShadow: '0 2px 12px rgba(255,123,156,0.3)',
                    }}
                  >
                    <Sparkles size={14} />
                    去逛逛
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={`list-${activeTab}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {displayedOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8" />
      </div>
    </div>
  )
}
