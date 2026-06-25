import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Heart, Sparkles, X, Feather, Clock, Mail } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { EmptyState } from '../components/ui/EmptyState'
import { Confetti } from '../components/ui/Confetti'
import { MOODS, LOVE_LETTER_PROMPTS } from '../config/constants'
import { formatRelativeTime } from '../lib/dates'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

interface LetterItem {
  id: string
  author_id: string
  recipient_id: string
  title: string
  content: string
  mood: string | null
  is_opened: boolean
  opened_at: string | null
  created_at: string
}

type TabType = 'received' | 'sent'

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

function loadLetters(): LetterItem[] {
  try {
    const raw = localStorage.getItem('demo_letters')
    return raw ? (JSON.parse(raw) as LetterItem[]) : []
  } catch { return [] }
}

function saveLetters(letters: LetterItem[]) {
  localStorage.setItem('demo_letters', JSON.stringify(letters))
}

function generateId(): string {
  return `letter-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/* ──────────────────────────────────────────────────
   Seal Sparkle Particles
   ────────────────────────────────────────────────── */

function SealSparkles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * 360
        const rad = (angle * Math.PI) / 180
        const distance = 60 + Math.random() * 80
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 1, opacity: 0.9 }}
            animate={{ x: Math.cos(rad) * distance, y: Math.sin(rad) * distance, scale: 0, opacity: 0 }}
            transition={{ duration: 0.8 + Math.random() * 0.5, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/3"
          >
            <span className="text-lg">✦</span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main Component — 星际来信
   ────────────────────────────────────────────────── */

export default function LettersPage() {
  const { profile, partner } = useCoupleStore()
  const { addToast } = useUIStore()

  const currentUserId = profile?.id || 'demo-user-1'
  const partnerId = partner?.id || 'demo-user-2'

  const [letters, setLetters] = useState<LetterItem[]>(loadLetters)
  const [activeTab, setActiveTab] = useState<TabType>('received')
  const [showConfetti, setShowConfetti] = useState(false)

  // Write
  const [writeOpen, setWriteOpen] = useState(false)
  const [writeTitle, setWriteTitle] = useState('')
  const [writeContent, setWriteContent] = useState('')
  const [writeMood, setWriteMood] = useState('')
  const [sending, setSending] = useState(false)
  const [activePromptIndex, setActivePromptIndex] = useState(Math.floor(Math.random() * LOVE_LETTER_PROMPTS.length))

  // Reader
  const [readerOpen, setReaderOpen] = useState(false)
  const [readingLetter, setReadingLetter] = useState<LetterItem | null>(null)
  const [sealBreaking, setSealBreaking] = useState(false)
  const [sealBroken, setSealBroken] = useState(false)
  const [sparkleActive, setSparkleActive] = useState(false)

  useEffect(() => { saveLetters(letters) }, [letters])

  const receivedLetters = letters.filter((l) => l.recipient_id === currentUserId)
  const sentLetters = letters.filter((l) => l.author_id === currentUserId)
  const unopenedCount = receivedLetters.filter((l) => !l.is_opened).length

  const handleSendLetter = useCallback(() => {
    if (!writeTitle.trim() || !writeContent.trim()) return
    setSending(true)
    setTimeout(() => {
      const newLetter: LetterItem = {
        id: generateId(),
        author_id: currentUserId,
        recipient_id: partnerId,
        title: writeTitle.trim(),
        content: writeContent.trim(),
        mood: writeMood || null,
        is_opened: false,
        opened_at: null,
        created_at: new Date().toISOString(),
      }
      setLetters((prev) => [newLetter, ...prev])
      setWriteTitle(''); setWriteContent(''); setWriteMood(''); setWriteOpen(false); setSending(false)
      setActivePromptIndex(Math.floor(Math.random() * LOVE_LETTER_PROMPTS.length))
      addToast('💌 星际消息已发送！', 'success')
    }, 800)
  }, [writeTitle, writeContent, writeMood, currentUserId, partnerId, addToast])

  const handleOpenLetter = useCallback((letter: LetterItem) => {
    setReadingLetter(letter)
    if (!letter.is_opened) {
      setSealBreaking(true); setSealBroken(false); setSparkleActive(true); setReaderOpen(true)
      setTimeout(() => {
        setSealBroken(true); setSealBreaking(false); setSparkleActive(false)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2500)
        setLetters((prev) => prev.map((l) =>
          l.id === letter.id ? { ...l, is_opened: true, opened_at: new Date().toISOString() } : l
        ))
      }, 1400)
    } else {
      setSealBreaking(false); setSealBroken(true); setSparkleActive(false); setReaderOpen(true)
    }
  }, [])

  const handleCloseReader = () => {
    setReaderOpen(false); setReadingLetter(null)
    setSealBreaking(false); setSealBroken(false); setSparkleActive(false)
  }

  const getMoodInfo = (moodValue: string | null) => {
    if (!moodValue) return null
    return MOODS.find((m) => m.value === moodValue)
  }

  const isCurrentUser = (letter: LetterItem) => letter.author_id === currentUserId
  const displayedLetters = activeTab === 'received' ? receivedLetters : sentLetters

  return (
    <div className="space-y-5 pb-6 px-4">
      <Confetti active={showConfetti} duration={2500} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-[var(--font-display)]">
            <span className="text-glow">星际来信</span>
            {' '}
            <span className="inline-block animate-float">💌</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1 flex items-center gap-1.5">
            {unopenedCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(255,107,157,0.15)', color: '#FF6B9D' }}>
                <Mail size={12} />
                {unopenedCount} 封未读
              </span>
            ) : '穿越星河的讯息 ✦'}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWriteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
            color: '#fff',
            boxShadow: '0 0 16px rgba(255,107,157,0.3)',
          }}
        >
          <Send size={16} />
          写信
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative flex gap-1 p-1.5 rounded-2xl"
        style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-1.5 bottom-1.5 rounded-xl"
          style={{
            left: activeTab === 'received' ? '0.375rem' : 'calc(50% + 0.125rem)',
            width: 'calc(50% - 0.5rem)',
            background: 'rgba(255,107,157,0.12)',
            border: '1px solid rgba(255,107,157,0.2)',
          }}
        />
        {(['received', 'sent'] as TabType[]).map((tab) => (
          <motion.button
            key={tab}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTab(tab)}
            className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
            }`}
          >
            {tab === 'received' ? <Mail size={16} /> : <Send size={16} />}
            <span>{tab === 'received' ? '收到的' : '发出的'}</span>
            {tab === 'received' && unopenedCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-bold"
                style={{ background: '#FF6B9D', color: '#fff' }}
              >
                {unopenedCount}
              </motion.span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Letter List */}
      <AnimatePresence mode="wait">
        {displayedLetters.length === 0 ? (
          <motion.div key={`empty-${activeTab}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmptyState
              icon={activeTab === 'received' ? '💌' : '✉️'}
              title={activeTab === 'received' ? '还没有收到的信' : '还没有发出的信'}
              description={activeTab === 'received' ? '等待TA的第一颗星 ✦' : '写一封穿越星河的讯息吧'}
              action={activeTab === 'sent' ? { label: '写一封信', onClick: () => setWriteOpen(true) } : undefined}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`list-${activeTab}`}
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            className="space-y-4"
          >
            {displayedLetters.map((letter) => {
              const moodInfo = getMoodInfo(letter.mood)
              const isReceived = activeTab === 'received'
              return (
                <motion.div
                  key={letter.id}
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.97 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenLetter(letter)}
                  className="cursor-pointer"
                >
                  <div className="relative">
                    {/* Glow for unopened received */}
                    {!letter.is_opened && isReceived && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -inset-1 rounded-[22px] pointer-events-none -z-10"
                        style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(192,132,252,0.2))', filter: 'blur(8px)' }}
                      />
                    )}

                    {/* Envelope Card */}
                    <div className={`panel p-5 relative overflow-hidden break-word ${
                      !letter.is_opened && isReceived ? '' : ''
                    }`}
                      style={!letter.is_opened && isReceived
                        ? { border: '1px solid rgba(255,107,157,0.25)', boxShadow: '0 0 16px rgba(255,107,157,0.1), 0 2px 16px rgba(0,0,0,0.3)' }
                        : {}
                      }>

                      {/* Envelope flap triangle for sealed */}
                      {!letter.is_opened && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <div style={{
                            width: 0, height: 0,
                            borderLeft: '26px solid transparent',
                            borderRight: '26px solid transparent',
                            borderTop: isReceived ? '20px solid #C084FC' : '20px solid #6A6A8A',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                          }} />
                        </div>
                      )}

                      {/* Glowing seal dot (star-like) for unopened received */}
                      {!letter.is_opened && isReceived && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          className="absolute top-3 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
                          style={{
                            background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                            boxShadow: '0 0 16px rgba(255,107,157,0.4)',
                          }}
                        >
                          <Star size={14} className="text-white" fill="white" />
                        </motion.div>
                      )}

                      {/* Opened seal (muted) */}
                      {letter.is_opened && isReceived && (
                        <div className="absolute top-3 right-4 w-7 h-7 rounded-full flex items-center justify-center z-10 opacity-40"
                          style={{ background: 'rgba(106,106,138,0.3)' }}>
                          <Star size={10} className="text-[var(--color-text-muted)]" fill="currentColor" />
                        </div>
                      )}

                      {/* Content */}
                      <div className={!letter.is_opened ? 'mt-4' : ''}>
                        <div className="flex items-center gap-2.5 mb-2">
                          {moodInfo && <span className="text-xl">{moodInfo.emoji}</span>}
                          <h3 className="font-semibold text-[var(--color-text)] flex-1 break-word">{letter.title}</h3>
                          {letter.is_opened ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#6A6A8A' }}>已读</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{
                                background: isReceived ? 'rgba(255,107,157,0.15)' : 'rgba(255,255,255,0.05)',
                                color: isReceived ? '#FF6B9D' : '#6A6A8A',
                              }}>未读</span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-2 leading-relaxed break-word">
                          {letter.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock size={11} className="text-[var(--color-text-muted)]" />
                          <span className="text-xs text-[var(--color-text-muted)]">{formatRelativeTime(letter.created_at)}</span>
                          <span className="text-xs text-[var(--color-text-muted)]">{isReceived ? '· 来自 TA' : '· 发给 TA'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Letter Modal */}
      <AnimatePresence>
        {writeOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setWriteOpen(false)}
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
                    <span className="text-2xl">💌</span>
                    <h3 className="text-lg font-bold"><span className="text-glow">写一封星际消息</span></h3>
                  </div>
                  <button onClick={() => setWriteOpen(false)} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.05)] transition-colors cursor-pointer">
                    <X size={20} className="text-[var(--color-text-muted)]" />
                  </button>
                </div>

                {/* Recipient */}
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ background: 'rgba(255,107,157,0.06)', border: '1px solid rgba(255,107,157,0.1)' }}>
                  <Feather size={16} style={{ color: '#FF6B9D' }} />
                  <p className="text-xs text-[var(--color-text-muted)]">
                    这封信将发送给 <span style={{ color: '#FF6B9D' }} className="font-semibold">{partner?.display_name || 'TA'}</span>
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">标题 <span style={{ color: '#FF6B9D' }}>*</span></label>
                  <input
                    type="text" value={writeTitle} onChange={(e) => setWriteTitle(e.target.value)}
                    placeholder="给这封信起个美丽的名字..."
                    maxLength={50} autoFocus
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">内容 <span style={{ color: '#FF6B9D' }}>*</span></label>
                  <div className="relative">
                    <textarea
                      value={writeContent} onChange={(e) => setWriteContent(e.target.value)}
                      placeholder={LOVE_LETTER_PROMPTS[activePromptIndex]}
                      maxLength={1000} rows={6}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                      style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActivePromptIndex((activePromptIndex + 1) % LOVE_LETTER_PROMPTS.length)}
                      className="absolute right-2 top-2 text-[10px] text-[var(--color-text-muted)] px-2.5 py-1 rounded-lg cursor-pointer"
                      style={{ background: 'rgba(20,20,50,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <RefreshIcon />
                      换提示
                    </motion.button>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1.5 text-right">{writeContent.length}/1000</p>
                </div>

                {/* Mood */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    心情 <span className="text-xs text-[var(--color-text-muted)] font-normal">(可选)</span>
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {MOODS.map((mood) => (
                      <motion.button
                        key={mood.value}
                        whileTap={{ scale: 0.93 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setWriteMood(writeMood === mood.value ? '' : mood.value)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer`}
                        style={{
                          background: writeMood === mood.value ? 'rgba(255,107,157,0.2)' : 'rgba(20,20,50,0.5)',
                          border: writeMood === mood.value ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          color: writeMood === mood.value ? '#FF6B9D' : '#A0A0C0',
                          boxShadow: writeMood === mood.value ? '0 0 12px rgba(255,107,157,0.2)' : 'none',
                        }}
                      >
                        <span className="text-base">{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Send */}
                <div className="flex items-center justify-center pt-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.04 }}
                    onClick={handleSendLetter}
                    disabled={!writeTitle.trim() || !writeContent.trim() || sending}
                    className="cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <motion.div
                      animate={sending ? { scale: [1, 1.3, 0.9, 1], rotate: [0, 8, -8, 0] } : {}}
                      transition={{ duration: 0.8 }}
                      className="w-20 h-20 rounded-full flex flex-col items-center justify-center gap-0.5"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                        boxShadow: '0 0 24px rgba(255,107,157,0.4)',
                      }}
                    >
                      {sending ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      ) : (
                        <>
                          <Heart size={18} fill="white" className="text-white" />
                          <span className="text-[10px] text-white font-bold tracking-wider">发送</span>
                        </>
                      )}
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Letter Reader Modal */}
      <AnimatePresence>
        {readerOpen && readingLetter && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleCloseReader}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 120, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 80, scale: 0.94 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative z-10 w-full sm:max-w-md max-h-[85dvh] overflow-y-auto mx-4"
            >
              {/* Seal breaking animation */}
              <AnimatePresence>
                {sealBreaking && !sealBroken && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <motion.div
                      initial={{ opacity: 1, scale: 0.5 }}
                      animate={{ opacity: [1, 0.7, 0], scale: [1, 1.5, 0.3] }}
                      transition={{ duration: 1.3, ease: 'easeInOut' }}
                      className="w-28 h-28 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                        boxShadow: '0 0 40px rgba(255,107,157,0.6)',
                      }}
                    >
                      <Star size={36} className="text-white" fill="white" />
                    </motion.div>
                    <SealSparkles active />
                  </div>
                )}
              </AnimatePresence>

              {/* Letter Content */}
              <motion.div
                animate={sealBroken ? { opacity: 1, filter: 'blur(0px)' } : sealBreaking ? { opacity: 0.4, filter: 'blur(3px)' } : { opacity: 1 }}
                className="panel-glow p-7 overflow-hidden break-word"
              >
                {/* Close */}
                <button onClick={handleCloseReader} className="absolute top-3 right-3 z-10 p-2 rounded-full cursor-pointer hover:bg-[rgba(255,255,255,0.05)]">
                  <X size={18} className="text-[var(--color-text-muted)]" />
                </button>

                {/* Decorative top */}
                <div className="flex items-center justify-center mb-5">
                  <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,215,0,0.3)' }}>
                    <div className="w-10 h-px" style={{ background: 'rgba(255,215,0,0.3)' }} />
                    <Sparkles size={14} />
                    <div className="w-10 h-px" style={{ background: 'rgba(255,215,0,0.3)' }} />
                  </div>
                </div>

                <div className="relative space-y-5">
                  {getMoodInfo(readingLetter.mood) && (
                    <div className="text-center">
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                        className="text-4xl inline-block">
                        {getMoodInfo(readingLetter.mood)!.emoji}
                      </motion.span>
                    </div>
                  )}

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-[var(--color-text)] text-center break-word"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {readingLetter.title}
                  </motion.h2>

                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.3))' }} />
                    <Heart size={12} className="text-heart" fill="#FF4470" />
                    <div className="w-10 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.3))' }} />
                  </div>

                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-sm text-[var(--color-text-soft)] leading-relaxed whitespace-pre-wrap break-word"
                  >
                    {readingLetter.content}
                  </motion.p>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="w-10 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(255,215,0,0.2))' }} />
                    <Sparkles size={12} style={{ color: 'rgba(255,215,0,0.4)' }} />
                    <div className="w-10 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(255,215,0,0.2))' }} />
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-center space-y-1.5 pt-2">
                    <p className="text-xs text-[var(--color-text-muted)] italic">
                      {isCurrentUser(readingLetter) ? '—— 我写给 TA' : '—— TA 写给我'}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatRelativeTime(readingLetter.created_at)}</p>
                    {readingLetter.is_opened && readingLetter.opened_at && (
                      <p className="text-[10px] text-[var(--color-text-muted)]">已读于 {formatRelativeTime(readingLetter.opened_at)}</p>
                    )}
                  </motion.div>
                </div>

                <div className="flex items-center justify-center mt-5">
                  <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,215,0,0.3)' }}>
                    <div className="w-10 h-px" style={{ background: 'rgba(255,215,0,0.3)' }} />
                    <Sparkles size={14} />
                    <div className="w-10 h-px" style={{ background: 'rgba(255,215,0,0.3)' }} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        onClick={() => setWriteOpen(true)}
        className="fixed bottom-24 right-4 z-20 flex items-center justify-center cursor-pointer"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
          boxShadow: '0 0 24px rgba(255,107,157,0.4)',
        }}
      >
        <Send size={24} className="text-white" />
      </motion.button>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Inline Refresh Icon
   ────────────────────────────────────────────────── */

function RefreshIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

/* Need Star icon inline */
function Star({ size = 14, className = '', fill = 'none' }: { size?: number; className?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
