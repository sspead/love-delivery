import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Plus, Star, Check, Sparkles, Send } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { EmptyState } from '../components/ui/EmptyState'
import { Confetti } from '../components/ui/Confetti'
import { WISH_CATEGORIES } from '../config/constants'
import { formatRelativeTime } from '../lib/dates'

interface WishItem {
  id: string
  title: string
  description: string | null
  category: string | null
  author_id: string
  is_fulfilled: boolean
  created_at: string
}

type FilterTab = '全部' | '未实现' | '已实现'

const TABS: { label: FilterTab; icon: string }[] = [
  { label: '全部', icon: '✦' },
  { label: '未实现', icon: '⋆' },
  { label: '已实现', icon: '⭐' },
]

function loadWishes(): WishItem[] {
  try {
    const raw = localStorage.getItem('demo_wishes')
    return raw ? (JSON.parse(raw) as WishItem[]) : []
  } catch { return [] }
}

function saveWishes(wishes: WishItem[]) {
  localStorage.setItem('demo_wishes', JSON.stringify(wishes))
}

function generateId(): string {
  return `wish-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/* ──────────────────────────────────────────────────
   Constellation Visualization
   ────────────────────────────────────────────────── */

function ConstellationGathering({ wishCount, fulfilledCount }: { wishCount: number; fulfilledCount: number }) {
  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 5 + ((i * 31) % 85),
    top: 5 + ((i * 19) % 80),
    delay: i * 0.5,
    size: 3 + (i % 4),
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center justify-center py-8"
    >
      {/* Nebula glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,107,157,0.1) 0%, transparent 70%)' }} />

      {/* Twinkling constellation stars */}
      {stars.map((s) => (
        <motion.div
          key={`star-${s.id}`}
          animate={{ opacity: [0.15, 1, 0.15], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2.5 + (s.id % 3), repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
            background: s.id % 3 === 0 ? '#FFD700' : s.id % 3 === 1 ? '#FF6B9D' : '#C084FC',
            boxShadow: s.id % 3 === 0
              ? '0 0 6px #FFD700, 0 0 12px rgba(255,215,0,0.3)'
              : s.id % 3 === 1
                ? '0 0 6px #FF6B9D, 0 0 12px rgba(255,107,157,0.3)'
                : '0 0 6px #C084FC, 0 0 12px rgba(192,132,252,0.3)',
          }}
        />
      ))}

      {/* Constellation lines between stars */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.15 }}>
        {stars.slice(0, -1).map((s, i) => (
          <line
            key={`line-${i}`}
            x1={`${s.left}%`} y1={`${s.top}%`}
            x2={`${stars[i + 1].left}%`} y2={`${stars[i + 1].top}%`}
            stroke={i % 3 === 0 ? '#FF6B9D' : i % 3 === 1 ? '#C084FC' : '#FFD700'}
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Central gathering orb */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,157,0.15) 0%, rgba(192,132,252,0.1) 50%, transparent 70%)',
          border: '1px solid rgba(255,107,157,0.2)',
          boxShadow: '0 0 30px rgba(255,107,157,0.15), 0 0 60px rgba(192,132,252,0.1)',
        }}
      >
        <span className="text-4xl">{wishCount > 0 ? '🌟' : '🪐'}</span>
      </motion.div>

      {/* Count badge */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="mt-4 z-10"
      >
        <div className="panel px-6 py-2.5 flex items-center gap-4">
          <div className="text-center">
            <span className="text-glow text-xl font-bold">{wishCount}</span>
            <span className="text-[var(--color-text-muted)] text-xs ml-1">个心愿</span>
          </div>
          <div className="w-[1px] h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="text-center">
            <span className="text-glow-gold text-xl font-bold">{fulfilledCount}</span>
            <span className="text-[var(--color-text-muted)] text-xs ml-1">已实现</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Wish Card
   ────────────────────────────────────────────────── */

function WishCard({ wish, index, onFulfill, fulfillingId }: {
  wish: WishItem
  index: number
  onFulfill: (id: string) => void
  fulfillingId: string | null
}) {
  const { profile } = useCoupleStore()

  const getCategoryIcon = (value: string | null) => {
    if (!value) return '💡'
    const cat = WISH_CATEGORIES.find((c) => c.value === value)
    return cat?.icon ?? '💡'
  }

  const getCategoryLabel = (value: string | null) => {
    if (!value) return '其他'
    const cat = WISH_CATEGORIES.find((c) => c.value === value)
    return cat?.label ?? '其他'
  }

  const isAuthor = wish.author_id === (profile?.id || 'demo-user-1')
  const rotation = index % 3 === 0 ? -1 : index % 3 === 1 ? 1.5 : -0.5

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation * 3 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ type: 'spring', stiffness: 180, damping: 22, delay: index * 0.06 }}
      whileHover={{ scale: 1.03, rotate: 0, zIndex: 20 }}
      className="relative"
    >
      <div className={`panel p-5 relative overflow-hidden transition-all ${
        wish.is_fulfilled ? '' : ''
      }`}
        style={wish.is_fulfilled
          ? { border: '1px solid rgba(255,215,0,0.3)', boxShadow: '0 0 20px rgba(255,215,0,0.15), 0 2px 16px rgba(0,0,0,0.3)' }
          : { border: '1px solid rgba(255,255,255,0.08)' }
        }>

        {/* Fulfilled gold glow overlay */}
        {wish.is_fulfilled && (
          <div className="absolute inset-0 rounded-[20px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.08) 0%, transparent 70%)' }} />
        )}

        {/* Fulfilled checkmark */}
        {wish.is_fulfilled && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center z-10"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              boxShadow: '0 0 16px rgba(255,215,0,0.4)',
            }}
          >
            <Check size={16} strokeWidth={3.5} className="text-white" />
          </motion.div>
        )}

        <div className="relative space-y-2.5">
          {/* Top row */}
          <div className="flex items-center gap-2">
            <motion.span whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }} className="text-xl">
              {getCategoryIcon(wish.category)}
            </motion.span>
            <span className="text-[10px] font-medium text-[var(--color-text-muted)] px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {getCategoryLabel(wish.category)}
            </span>
            {wish.is_fulfilled && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}
              >
                <Sparkles size={11} />
                已实现
              </motion.span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-semibold text-[var(--color-text)] leading-snug break-word ${
            wish.is_fulfilled ? 'line-through opacity-60' : ''
          }`}>
            {wish.title}
          </h3>

          {/* Description */}
          {wish.description && (
            <p className={`text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2 break-word ${
              wish.is_fulfilled ? 'line-through opacity-40' : ''
            }`}>
              {wish.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                style={{
                  background: isAuthor
                    ? 'linear-gradient(135deg, #FF6B9D, #C084FC)'
                    : 'linear-gradient(135deg, #4ADE80, #60A5FA)',
                }}>
                {isAuthor ? '我' : 'TA'}
              </div>
              <span className="text-[11px] text-[var(--color-text-muted)]">{formatRelativeTime(wish.created_at)}</span>
            </div>

            {!wish.is_fulfilled && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); onFulfill(wish.id) }}
                disabled={fulfillingId === wish.id}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                style={{
                  background: 'rgba(255,107,157,0.12)',
                  color: '#FF6B9D',
                  border: '1px solid rgba(255,107,157,0.2)',
                }}
              >
                {fulfillingId === wish.id ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Sparkles size={13} />}
                <span>{fulfillingId === wish.id ? '实现中...' : '实现'}</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Sparkle Burst
   ────────────────────────────────────────────────── */

function SparkleBurst({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string; delay: number }[]>([])
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!active) return
    const emojis = ['✨', '💫', '⭐', '🌟', '💛', '✦']
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
      y: -(Math.random() * 150 + 30),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 0.4,
    }))
    setParticles(newParticles)
    setShow(true)
    const timer = setTimeout(() => setShow(false), 2000)
    return () => clearTimeout(timer)
  }, [active])

  if (!show) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: [0, 1.5, 1, 0] }}
          transition={{ duration: 1.5, delay: p.delay, ease: 'easeOut' }}
          className="absolute text-lg"
          style={{ left: '50%', top: '50%' }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main Page — 心愿星群
   ────────────────────────────────────────────────── */

export default function WishJarPage() {
  const { profile } = useCoupleStore()
  const { addToast } = useUIStore()

  const [wishes, setWishes] = useState<WishItem[]>(loadWishes)
  const [activeTab, setActiveTab] = useState<FilterTab>('全部')
  const [addOpen, setAddOpen] = useState(false)
  const [fulfillingId, setFulfillingId] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSparkle, setShowSparkle] = useState(false)
  const [sparkleKey, setSparkleKey] = useState(0)

  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCategory, setFormCategory] = useState('')

  useEffect(() => { saveWishes(wishes) }, [wishes])

  const filteredWishes = wishes.filter((w) => {
    if (activeTab === '未实现') return !w.is_fulfilled
    if (activeTab === '已实现') return w.is_fulfilled
    return true
  })

  const fulfilledCount = wishes.filter((w) => w.is_fulfilled).length

  const handleAddWish = useCallback(() => {
    if (!formTitle.trim()) return
    const newWish: WishItem = {
      id: generateId(),
      title: formTitle.trim(),
      description: formDesc.trim() || null,
      category: formCategory || null,
      author_id: profile?.id || 'demo-user-1',
      is_fulfilled: false,
      created_at: new Date().toISOString(),
    }
    setWishes((prev) => [newWish, ...prev])
    setFormTitle(''); setFormDesc(''); setFormCategory(''); setAddOpen(false)
    addToast('心愿已加入星群！🌟', 'success')
  }, [formTitle, formDesc, formCategory, profile?.id, addToast])

  const handleFulfill = useCallback((wishId: string) => {
    setFulfillingId(wishId)
    setSparkleKey((k) => k + 1)
    setShowSparkle(true)
    setTimeout(() => setShowSparkle(false), 2000)
    setTimeout(() => {
      setWishes((prev) => prev.map((w) => w.id === wishId ? { ...w, is_fulfilled: true } : w))
      setShowConfetti(true)
      addToast('✨ 心愿实现啦！', 'love')
      setTimeout(() => { setFulfillingId(null); setShowConfetti(false) }, 400)
    }, 500)
  }, [addToast])

  return (
    <div className="pb-8 px-4">
      <Confetti active={showConfetti} duration={2500} />
      <SparkleBurst key={sparkleKey} active={showSparkle} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="pt-2 pb-2"
      >
        <div className="relative inline-block">
          <h1 className="text-4xl font-bold tracking-wide font-[var(--font-display)]">
            <span className="text-glow">心愿星群</span>
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="h-[3px] rounded-full mt-1 origin-left"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #FF6B9D, #C084FC)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
            }}
          />
          <motion.span
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -right-7 text-lg"
          >🌟</motion.span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 ml-1">
          {wishes.length === 0 ? '投下第一颗星，点亮你们的夜空' : '每一颗星，都是对未来的期许 ⋆'}
        </p>
      </motion.div>

      {/* Constellation Gathering */}
      <ConstellationGathering wishCount={wishes.length} fulfilledCount={fulfilledCount} />

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar"
      >
        <LayoutGroup>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.label
            let count = wishes.length
            if (tab.label === '未实现') count = wishes.filter((w) => !w.is_fulfilled).length
            if (tab.label === '已实现') count = wishes.filter((w) => w.is_fulfilled).length

            return (
              <motion.button
                key={tab.label}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveTab(tab.label)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive ? 'text-white' : 'text-[var(--color-text-muted)]'
                }`}
                style={{
                  background: isActive ? 'transparent' : 'rgba(20,20,50,0.5)',
                  border: isActive ? 'none' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #C084FC, #FF6B9D)',
                      boxShadow: '0 0 16px rgba(192,132,252,0.4)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.icon}</span>
                <span className="relative z-10">{tab.label}</span>
                <span className={`relative z-10 ml-0.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'text-[var(--color-text-muted)]'
                }`} style={{ background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)' }}>
                  {count}
                </span>
              </motion.button>
            )
          })}
        </LayoutGroup>
      </motion.div>

      {/* Wish List */}
      {filteredWishes.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {activeTab === '全部' ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative">
              <motion.div
                animate={{ y: [0, -25, 0], x: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 left-10 text-4xl opacity-20 pointer-events-none"
              >💫</motion.div>
              <motion.div
                animate={{ y: [0, -20, 0], x: [0, -12, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-16 right-8 text-3xl opacity-15 pointer-events-none"
              >⭐</motion.div>

              <motion.div
                animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="text-7xl mb-6"
              >🪐</motion.div>
              <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">星群还在等待第一颗星</h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                一起写下你们的愿望
                <br />让它们在星空下闪闪发光
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAddOpen(true)}
                className="mt-8 px-6 py-3 rounded-2xl text-white font-semibold text-sm cursor-pointer flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                  boxShadow: '0 0 20px rgba(255,107,157,0.3)',
                }}
              >
                <Star size={16} />
                许下第一个心愿
              </motion.button>
            </div>
          ) : (
            <EmptyState
              icon={activeTab === '已实现' ? '✨' : '💫'}
              title={activeTab === '已实现' ? '还没有已实现的心愿' : '所有心愿都还在等待'}
              description={activeTab === '已实现' ? '点击心愿上的"实现"按钮来标记吧' : '继续努力，每颗星都会发光'}
            />
          )}
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {filteredWishes.map((wish, index) => (
            <WishCard key={wish.id} wish={wish} index={index} onFulfill={handleFulfill} fulfillingId={fulfillingId} />
          ))}
        </motion.div>
      )}

      <div className="h-20" />

      {/* Add Wish FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260, delay: 0.3 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => setAddOpen(true)}
        className="fixed bottom-24 right-4 z-30 flex items-center justify-center cursor-pointer"
        style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
          boxShadow: '0 0 24px rgba(255,107,157,0.5)',
        }}
      >
        <Plus size={28} strokeWidth={2.5} className="text-white" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-1 rounded-full border-2 border-[rgba(255,255,255,0.15)]"
        />
      </motion.button>

      {/* Add Wish Modal */}
      <AnimatePresence>
        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddOpen(false)}
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
                <div className="flex items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', boxShadow: '0 0 16px rgba(255,215,0,0.3)' }}>
                    <span className="text-lg">🌟</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">许下心愿</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">让星光承载你们的愿望</p>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    心愿标题 <span style={{ color: '#FF6B9D' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例如：一起看极光"
                    maxLength={50}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{
                      background: 'rgba(15,15,46,0.8)',
                      border: formTitle ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: formTitle ? '0 0 12px rgba(255,107,157,0.06)' : 'none',
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-[var(--color-text-muted)]">给你的心愿起一个美好的名字</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{formTitle.length}/50</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    描述 <span className="text-[var(--color-text-muted)] font-normal text-xs">（可选）</span>
                  </label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="描述一下这个愿望..."
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{
                      background: 'rgba(15,15,46,0.8)',
                      border: formDesc ? '1px solid rgba(192,132,252,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">分类</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {WISH_CATEGORIES.map((cat) => {
                      const isSelected = formCategory === cat.value
                      return (
                        <motion.button
                          key={cat.value}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFormCategory(isSelected ? '' : cat.value)}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl text-sm transition-all cursor-pointer`}
                          style={{
                            background: isSelected ? 'rgba(255,107,157,0.12)' : 'rgba(20,20,50,0.5)',
                            border: isSelected ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: isSelected ? '0 0 16px rgba(255,107,157,0.15)' : 'none',
                          }}
                        >
                          <motion.span className="text-2xl" animate={isSelected ? { scale: [1, 1.2, 1] } : {}}>
                            {cat.icon}
                          </motion.span>
                          <span className={`text-xs font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                            {cat.label}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddWish}
                  disabled={!formTitle.trim()}
                  className="w-full py-3.5 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                    boxShadow: '0 0 20px rgba(255,107,157,0.3)',
                  }}
                >
                  <Star size={18} />
                  投入星群
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
