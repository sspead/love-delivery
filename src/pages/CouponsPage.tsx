import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Ticket, Gift, Clock, Sparkles, X } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { EmptyState } from '../components/ui/EmptyState'
import { Confetti } from '../components/ui/Confetti'
import { COUPON_SUGGESTIONS } from '../config/constants'
import { formatRelativeTime } from '../lib/dates'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

interface CouponItem {
  id: string
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

const EMOJI_GRID = [
  '💆', '😤', '🎬', '🍳', '🍽️', '💝', '🎤', '🤗',
  '💋', '🎁', '🌸', '☕', '🎵', '📖', '🌙', '🎮',
  '🍰', '💐', '🫂', '😴', '🍿', '🎨', '✈️', '🧸',
]

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

function loadCoupons(): CouponItem[] {
  try {
    const raw = localStorage.getItem('demo_coupons')
    return raw ? (JSON.parse(raw) as CouponItem[]) : []
  } catch { return [] }
}

function saveCoupons(coupons: CouponItem[]) {
  localStorage.setItem('demo_coupons', JSON.stringify(coupons))
}

function generateId(): string {
  return `coupon-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/* ──────────────────────────────────────────────────
   Perforation dots
   ────────────────────────────────────────────────── */

function PerforationLine() {
  return (
    <div className="flex items-center justify-center gap-1 my-2.5">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,107,157,0.15)' }} />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Redeem sparkles
   ────────────────────────────────────────────────── */

function RedeemSparkles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center">
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360
        const rad = (angle * Math.PI) / 180
        const distance = 50 + Math.random() * 70
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: Math.cos(rad) * distance, y: Math.sin(rad) * distance, scale: 0, opacity: 0 }}
            transition={{ duration: 0.6 + Math.random() * 0.4, ease: 'easeOut' }}
            className="absolute"
          >
            <span className="text-base">{['✨', '💕', '🎉', '⭐', '✦'][Math.floor(Math.random() * 5)]}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main Component — 星光兑换券
   ────────────────────────────────────────────────── */

export default function CouponsPage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()

  const currentUserId = profile?.id || 'demo-user-1'
  const partnerId = partner?.id || 'demo-user-2'

  const [coupons, setCoupons] = useState<CouponItem[]>(loadCoupons)
  const [showConfetti, setShowConfetti] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formIcon, setFormIcon] = useState('💝')
  const [formDesc, setFormDesc] = useState('')
  const [formExpiry, setFormExpiry] = useState('')

  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [redeemSparkle, setRedeemSparkle] = useState<string | null>(null)

  useEffect(() => { saveCoupons(coupons) }, [coupons])

  const unredeemedCount = coupons.filter((c) => !c.is_redeemed && c.holder_id === currentUserId).length

  const handleCreateCoupon = useCallback(() => {
    if (!formTitle.trim()) return
    const newCoupon: CouponItem = {
      id: generateId(),
      creator_id: currentUserId,
      holder_id: partnerId,
      title: formTitle.trim(),
      description: formDesc.trim() || null,
      icon: formIcon,
      expires_at: formExpiry ? new Date(formExpiry).toISOString() : null,
      is_redeemed: false,
      redeemed_at: null,
      created_at: new Date().toISOString(),
    }
    setCoupons((prev) => [newCoupon, ...prev])
    setFormTitle(''); setFormIcon('💝'); setFormDesc(''); setFormExpiry(''); setCreateOpen(false)
    addToast('🎫 星光兑换券已创建！', 'success')
  }, [formTitle, formIcon, formDesc, formExpiry, currentUserId, partnerId, addToast])

  const handleRedeem = useCallback((couponId: string) => {
    setRedeemingId(couponId); setRedeemSparkle(couponId)
    setTimeout(() => {
      setCoupons((prev) => prev.map((c) => c.id === couponId ? { ...c, is_redeemed: true, redeemed_at: new Date().toISOString() } : c))
      setShowConfetti(true)
      addToast('🎉 兑换成功！', 'love')
      setTimeout(() => { setRedeemingId(null); setRedeemSparkle(null); setShowConfetti(false) }, 300)
    }, 500)
  }, [addToast])

  const handleSuggestionClick = (suggestion: (typeof COUPON_SUGGESTIONS)[number]) => {
    setFormTitle(suggestion.title); setFormIcon(suggestion.icon); setFormDesc(suggestion.description)
  }

  const isHolder = (coupon: CouponItem) => coupon.holder_id === currentUserId
  const isCreator = (coupon: CouponItem) => coupon.creator_id === currentUserId

  const isExpired = (coupon: CouponItem) => {
    if (!coupon.expires_at) return false
    return new Date(coupon.expires_at) < new Date()
  }

  const displayCoupons = coupons

  return (
    <div className="space-y-5 pb-6 px-4">
      <Confetti active={showConfetti} duration={2500} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-display)]">
            <span className="text-glow">星光兑换券</span>
            {' '}
            <span className="inline-block animate-float">🎫</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {unredeemedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}>
                <Ticket size={12} />
                {unredeemedCount} 张待兑换
              </span>
            ) : '为TA创建一张星光兑换券 ✦'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #FF6B9D, #C084FC)', color: '#fff', boxShadow: '0 0 16px rgba(255,107,157,0.3)' }}
        >
          <Plus size={16} />
          创建
        </motion.button>
      </motion.div>

      {/* Coupon List */}
      {displayCoupons.length === 0 ? (
        <EmptyState
          icon="🎫"
          title="还没有星光兑换券"
          description="为TA创建一张吧 ✦"
          action={{ label: '创建星光兑换券', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <motion.div
          initial="hidden" animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className="space-y-4"
        >
          {displayCoupons.map((coupon) => {
            const expired = isExpired(coupon)
            return (
              <motion.div
                key={coupon.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.96 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
                }}
                className="relative"
              >
                <RedeemSparkles active={redeemSparkle === coupon.id} />

                <div className={`relative rounded-2xl overflow-hidden ${coupon.is_redeemed ? 'opacity-60' : ''}`}>
                  {/* Dashed glowing border */}
                  <div className="panel p-5 overflow-hidden break-word"
                    style={{
                      border: coupon.is_redeemed
                        ? '1px dashed rgba(255,255,255,0.06)'
                        : expired
                          ? '1px dashed rgba(255,215,0,0.15)'
                          : '1px dashed rgba(255,107,157,0.3)',
                      boxShadow: !coupon.is_redeemed && !expired
                        ? '0 0 12px rgba(255,107,157,0.1), 0 2px 16px rgba(0,0,0,0.3)'
                        : undefined,
                    }}>

                    {/* Top: Icon + Info */}
                    <div className="relative flex items-start gap-4">
                      <motion.div
                        animate={!coupon.is_redeemed && !expired ? { scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] } : {}}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{
                          background: coupon.is_redeemed
                            ? 'rgba(106,106,138,0.15)'
                            : 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(192,132,252,0.1))',
                          border: coupon.is_redeemed ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className={coupon.is_redeemed ? 'opacity-40' : ''}>{coupon.icon}</span>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-[var(--color-text)] text-base break-word ${
                          coupon.is_redeemed ? 'line-through opacity-40' : ''
                        }`}>
                          {coupon.title}
                        </h3>
                        {coupon.description && (
                          <p className="text-sm text-[var(--color-text-muted)] mt-0.5 line-clamp-2 leading-relaxed break-word">
                            {coupon.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] text-[var(--color-text-muted)] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {isCreator(coupon) ? '我创建的' : 'TA创建的'}
                          </span>
                          {coupon.expires_at && (
                            <span className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full ${
                              expired ? 'text-heart' : 'text-[var(--color-text-muted)]'
                            }`}
                              style={{ background: expired ? 'rgba(255,68,112,0.1)' : 'rgba(255,255,255,0.05)' }}>
                              <Clock size={10} />
                              {expired ? '已过期' : `至 ${new Date(coupon.expires_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Perforated tear line */}
                    <PerforationLine />

                    {/* Bottom: status + redeem */}
                    <div className="relative flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {coupon.is_redeemed
                          ? coupon.redeemed_at ? `已兑换于 ${formatRelativeTime(coupon.redeemed_at)}` : '已兑换'
                          : expired ? '已过期' : isHolder(coupon) ? '点击兑换使用' : '持有者: TA'}
                      </span>

                      {!coupon.is_redeemed && isHolder(coupon) && !expired && (
                        <motion.button
                          whileTap={{ scale: 0.88 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleRedeem(coupon.id)}
                          disabled={redeemingId === coupon.id}
                          className="px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                          style={{
                            background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                            color: '#fff',
                            boxShadow: '0 0 12px rgba(255,107,157,0.3)',
                          }}
                        >
                          {redeemingId === coupon.id ? (
                            <span className="flex items-center gap-1.5">
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                              兑换中...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1"><Sparkles size={12} />兑换</span>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Redeemed overlay stamp */}
                  <AnimatePresence>
                    {coupon.is_redeemed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -35 }}
                        animate={{ scale: 1, rotate: -15 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 16, delay: 0.1 }}
                        className="absolute top-5 right-5 pointer-events-none z-10"
                      >
                        <div className="px-3.5 py-2 border-[3px] rounded-xl rotate-[-15deg] whitespace-nowrap"
                          style={{
                            borderColor: 'rgba(106,106,138,0.5)',
                            background: 'rgba(20,20,50,0.8)',
                            backdropFilter: 'blur(4px)',
                          }}>
                          <span className="text-base font-black tracking-[0.3em] text-[var(--color-text-muted)]">
                            已兑换
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <div className="h-20" />

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-24 right-4 z-20 flex items-center justify-center cursor-pointer"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
          boxShadow: '0 0 24px rgba(255,107,157,0.4)',
        }}
      >
        <Plus size={26} className="text-white" />
      </motion.button>

      {/* Create Coupon Modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCreateOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md max-h-[85dvh] overflow-y-auto mx-2 panel-glow p-6 safe-bottom"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎫</span>
                    <h3 className="text-lg font-bold"><span className="text-glow">创建星光兑换券</span></h3>
                  </div>
                  <button onClick={() => setCreateOpen(false)} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
                    <X size={20} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>

                {/* Quick suggestions */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
                    <Sparkles size={14} style={{ color: '#FFD700' }} />
                    快速创建
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {COUPON_SUGGESTIONS.slice(0, 6).map((s) => (
                      <motion.button
                        key={s.title}
                        whileTap={{ scale: 0.94 }}
                        whileHover={{ scale: 1.03 }}
                        onClick={() => handleSuggestionClick(s)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer break-word ${
                          formTitle === s.title ? '' : ''
                        }`}
                        style={{
                          background: formTitle === s.title ? 'rgba(255,107,157,0.12)' : 'rgba(20,20,50,0.5)',
                          border: formTitle === s.title ? '1px solid rgba(255,107,157,0.3)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span className="text-lg flex-shrink-0">{s.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs" style={{ color: formTitle === s.title ? '#FF6B9D' : '#EAEAF0' }}>{s.title}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] line-clamp-1">{s.description}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">券名 <span style={{ color: '#FF6B9D' }}>*</span></label>
                  <input
                    type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例如：按摩券" maxLength={30}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Emoji picker */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">图标</label>
                  <div className="grid grid-cols-8 gap-2">
                    {EMOJI_GRID.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileTap={{ scale: 0.8 }}
                        whileHover={{ scale: 1.15 }}
                        onClick={() => setFormIcon(emoji)}
                        className="aspect-square flex items-center justify-center text-xl rounded-xl transition-all cursor-pointer"
                        style={{
                          background: formIcon === emoji ? 'rgba(255,107,157,0.15)' : 'rgba(20,20,50,0.5)',
                          border: formIcon === emoji ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: formIcon === emoji ? '0 0 12px rgba(255,107,157,0.15)' : 'none',
                        }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    描述 <span className="text-xs text-[var(--color-text-muted)] font-normal ml-1">(可选)</span>
                  </label>
                  <textarea
                    value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="这张券的用途..." maxLength={100} rows={2}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Expiry */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    有效期 <span className="text-xs text-[var(--color-text-muted)] font-normal ml-1">(可选)</span>
                  </label>
                  <input
                    type="date" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-[var(--color-text)]"
                    style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Recipient */}
                <div className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{ background: 'rgba(255,107,157,0.06)', border: '1px solid rgba(255,107,157,0.1)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,107,157,0.15)' }}>
                    <Gift size={16} style={{ color: '#FF6B9D' }} />
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    这张券将发送给 <span style={{ color: '#FF6B9D' }} className="font-bold">{partner?.display_name || 'TA'}</span>
                  </p>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCoupon}
                  disabled={!formTitle.trim()}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                    boxShadow: '0 0 20px rgba(255,107,157,0.3)',
                  }}
                >
                  <Ticket size={18} />
                  创建星光兑换券
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
