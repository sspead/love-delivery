import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircleHeart, Ticket, Gamepad2, Settings, ChevronRight, Heart, Sparkles } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

interface MenuCard {
  emoji: string
  icon: typeof MessageCircleHeart
  title: string
  description: string
  path: string
  accentColor: string
}

const menuCards: MenuCard[] = [
  {
    emoji: '💌',
    icon: MessageCircleHeart,
    title: '星际来信',
    description: '穿越星河的讯息 ✦',
    path: '/letters',
    accentColor: '#FF6B9D',
  },
  {
    emoji: '🎫',
    icon: Ticket,
    title: '星光兑换券',
    description: '专属恋爱兑换券 ⋆',
    path: '/coupons',
    accentColor: '#FFD700',
  },
  {
    emoji: '🎮',
    icon: Gamepad2,
    title: '星云游戏',
    description: '一起探索星云 ⭐',
    path: '/games',
    accentColor: '#C084FC',
  },
  {
    emoji: '⚙️',
    icon: Settings,
    title: '空间站设置',
    description: '管理你们的星域 🌙',
    path: '/settings',
    accentColor: '#C084FC',
  },
]

/* ──────────────────────────────────────────────────
   Menu Card Item
   ────────────────────────────────────────────────── */

function MenuCardItem({ card, index }: { card: MenuCard; index: number }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.08 + index * 0.07, duration: 0.45, ease: 'easeOut' }}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.03, y: -3 }}
        onClick={() => navigate(card.path)}
        className="w-full text-left cursor-pointer group relative"
      >
        <div className="panel-glow rounded-[1.75rem] p-5 overflow-hidden relative h-full">
          {/* Content */}
          <div className="relative z-10 flex flex-col gap-3">
            {/* Emoji icon with glowing dark circle */}
            <motion.div
              whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${card.accentColor}15, ${card.accentColor}08)`,
                border: `1px solid ${card.accentColor}20`,
                boxShadow: `0 0 20px ${card.accentColor}10`,
              }}
            >
              {/* Decorative glow dot */}
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-30"
                style={{ background: `linear-gradient(135deg, ${card.accentColor}, transparent)` }} />
              <span className="relative">{card.emoji}</span>
            </motion.div>

            {/* Title and description */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold text-[var(--color-text)] break-word">{card.title}</h3>
                <card.icon size={15} style={{ color: card.accentColor }} />
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed line-clamp-2 break-word">
                {card.description}
              </p>
            </div>

            {/* Arrow */}
            <motion.div whileHover={{ x: 4 }} className="self-end">
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: `${card.accentColor}15` }}>
                <ChevronRight size={16} style={{ color: card.accentColor }} />
              </div>
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <motion.div
            className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: `linear-gradient(90deg, transparent, ${card.accentColor}40, transparent)` }}
          />
        </div>
      </motion.button>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Main — 星图
   ────────────────────────────────────────────────── */

export default function MorePage() {
  const { profile, couple, loading } = useCoupleStore()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-4 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="pt-1 pb-2"
      >
        <h1 className="text-3xl font-bold font-[var(--font-display)]">
          <span className="text-glow">星图</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          探索你们的星光宇宙 ✦
        </p>
      </motion.div>

      {/* Couple info banner */}
      {!loading && couple && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="panel rounded-[1.75rem] p-4 relative overflow-hidden">
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(192,132,252,0.1))', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Heart size={20} style={{ color: '#FF6B9D' }} fill="#FF6B9D" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {profile?.display_name || '我'}
                  </span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="text-lg">💕</motion.span>
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {couple.partner
                      ? (couple.partner as { display_name: string }).display_name
                      : 'TA'}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{couple.name || '星光恋爱宇宙'}</p>
              </div>

              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="flex-shrink-0"
              >
                <Sparkles size={16} style={{ color: 'rgba(255,215,0,0.4)' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Menu grid 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {menuCards.map((card, index) => (
          <MenuCardItem key={card.path} card={card} index={index} />
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="mt-10 mb-2"
      >
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs text-[var(--color-text-muted)]">Made with</span>
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <Heart size={12} className="text-heart" fill="#FF4470" />
          </motion.span>
          <span className="text-xs text-[var(--color-text-muted)]">in the starlight ✦</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
