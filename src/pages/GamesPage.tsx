import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Heart, Star, Sparkles, RotateCcw } from 'lucide-react'
import { useUIStore } from '../stores/uiStore'
import { Confetti } from '../components/ui/Confetti'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

type GameView = 'hub' | 'memory' | 'quiz' | 'tictactoe'

interface MemoryCardData {
  id: number; emoji: string; flipped: boolean; matched: boolean
}

interface QuizQuestion {
  question: string; options: string[]; correctIndex: number
}

type TTTPlayer = '❤️' | '⭐'
type TTTCell = TTTPlayer | null

/* ──────────────────────────────────────────────────
   Memory Match Deck
   ────────────────────────────────────────────────── */

const MEMORY_EMOJIS = ['💕', '💖', '💗', '💘', '💝', '💟', '❣️', '❤️']

function createMemoryDeck(): MemoryCardData[] {
  const pairs = [...MEMORY_EMOJIS, ...MEMORY_EMOJIS]
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); [pairs[i], pairs[j]] = [pairs[j], pairs[i]]
  }
  return pairs.map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }))
}

/* ──────────────────────────────────────────────────
   Quiz Data
   ────────────────────────────────────────────────── */

const QUIZ_QUESTIONS: QuizQuestion[] = [
  { question: 'TA最喜欢的颜色是什么？', options: ['粉色', '蓝色', '紫色', '白色'], correctIndex: 0 },
  { question: 'TA的生日是哪一天？', options: ['1月15日', '3月8日', '6月21日', '12月25日'], correctIndex: 1 },
  { question: '你们第一次约会在哪里？', options: ['电影院', '咖啡厅', '公园', '商场'], correctIndex: 0 },
  { question: 'TA最喜欢的食物？', options: ['火锅', '日料', '烧烤', '甜品'], correctIndex: 2 },
  { question: 'TA平时最常说的话是？', options: ['随便', '好的', '累死了', '想你'], correctIndex: 3 },
  { question: 'TA的星座是什么？', options: ['双子座', '天秤座', '双鱼座', '天蝎座'], correctIndex: 2 },
  { question: 'TA最讨厌做什么？', options: ['洗碗', '早起', '排队', '逛街'], correctIndex: 1 },
  { question: '你们在一起多久了？', options: ['不到1个月', '1-6个月', '6个月-1年', '1年以上'], correctIndex: 3 },
  { question: 'TA最喜欢哪个季节？', options: ['春天', '夏天', '秋天', '冬天'], correctIndex: 0 },
  { question: 'TA的爱好是什么？', options: ['看电影', '打游戏', '旅行', '看书'], correctIndex: 2 },
]

/* ──────────────────────────────────────────────────
   Game Hub Cards
   ────────────────────────────────────────────────── */

interface GameInfo {
  key: GameView; emoji: string; title: string; subtitle: string; accentColor: string
}

const GAMES: GameInfo[] = [
  { key: 'memory', emoji: '🃏', title: '记忆翻牌', subtitle: '考验你们的默契', accentColor: '#FF6B9D' },
  { key: 'quiz', emoji: '💝', title: '默契问答', subtitle: '你有多了解TA？', accentColor: '#C084FC' },
  { key: 'tictactoe', emoji: '⭕', title: '井字棋', subtitle: '经典星战对决', accentColor: '#FFD700' },
]

/* ──────────────────────────────────────────────────
   Tic-Tac-Toe
   ────────────────────────────────────────────────── */

const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

const WIN_LINE_COORDS: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  '0,1,2': { x1: 8, y1: 17, x2: 92, y2: 17 },
  '3,4,5': { x1: 8, y1: 50, x2: 92, y2: 50 },
  '6,7,8': { x1: 8, y1: 83, x2: 92, y2: 83 },
  '0,3,6': { x1: 17, y1: 8, x2: 17, y2: 92 },
  '1,4,7': { x1: 50, y1: 8, x2: 50, y2: 92 },
  '2,5,8': { x1: 83, y1: 8, x2: 83, y2: 92 },
  '0,4,8': { x1: 10, y1: 10, x2: 90, y2: 90 },
  '2,4,6': { x1: 90, y1: 10, x2: 10, y2: 90 },
}

/* ──────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────── */

export default function GamesPage() {
  const [view, setView] = useState<GameView>('hub')
  const { addToast } = useUIStore()

  return (
    <div className="space-y-4 pb-6 px-4">
      <AnimatePresence mode="wait">
        {view === 'hub' && <GameHub key="hub" onSelectGame={setView} />}
        {view === 'memory' && <MemoryGame key="memory" onBack={() => setView('hub')} addToast={addToast} />}
        {view === 'quiz' && <QuizGame key="quiz" onBack={() => setView('hub')} addToast={addToast} />}
        {view === 'tictactoe' && <TicTacToeGame key="tictactoe" onBack={() => setView('hub')} addToast={addToast} />}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Game Hub
   ────────────────────────────────────────────────── */

function GameHub({ onSelectGame }: { onSelectGame: (g: GameView) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-[var(--font-display)]">
          <span className="text-glow">星云游戏</span>
          {' '}
          <span className="inline-block animate-float">🎮</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">和TA一起，在星云中游玩 ✦</p>
      </motion.div>

      <div className="space-y-4">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 22 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectGame(game.key)}
            className="cursor-pointer"
          >
            <div className="panel-glow p-6 overflow-hidden relative">
              {/* Decorative nebula blobs */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-[0.08]"
                style={{ background: game.accentColor }} />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-[0.06]"
                style={{ background: game.accentColor }} />

              <div className="relative flex items-center gap-5">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${game.accentColor}18, ${game.accentColor}08)`,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: `0 0 20px ${game.accentColor}15`,
                  }}
                >
                  {game.emoji}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-[var(--color-text)]">{game.title}</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{game.subtitle}</p>
                </div>

                <motion.div whileHover={{ x: 3 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={game.accentColor} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Memory Match Game
   ────────────────────────────────────────────────── */

function MemoryGame({ onBack, addToast }: {
  onBack: () => void
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'love') => void
}) {
  const [cards, setCards] = useState<MemoryCardData[]>(createMemoryDeck)
  const [flippedIds, setFlippedIds] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [checking, setChecking] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [victory, setVictory] = useState(false)

  const matchedCount = cards.filter((c) => c.matched).length

  useEffect(() => {
    if (matchedCount === cards.length && cards.length > 0 && !victory) {
      setVictory(true); setShowConfetti(true)
      addToast('🎉 恭喜！你找到了所有星座配对！', 'love')
    }
  }, [matchedCount, cards.length, victory, addToast])

  const handleCardClick = useCallback((cardId: number) => {
    if (checking) return
    const card = cards.find((c) => c.id === cardId)
    if (!card || card.flipped || card.matched) return
    if (flippedIds.length >= 2) return
    if (flippedIds.includes(cardId)) return

    const newFlippedIds = [...flippedIds, cardId]
    setFlippedIds(newFlippedIds)
    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)))

    if (newFlippedIds.length === 2) {
      setMoves((m) => m + 1); setChecking(true)
      const [firstId, secondId] = newFlippedIds
      const first = cards.find((c) => c.id === firstId)!
      const second = cards.find((c) => c.id === secondId)!
      if (first.emoji === second.emoji) {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === firstId || c.id === secondId ? { ...c, matched: true } : c))
          setFlippedIds([]); setChecking(false)
        }, 450)
      } else {
        setTimeout(() => {
          setCards((prev) => prev.map((c) => c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c))
          setFlippedIds([]); setChecking(false)
        }, 700)
      }
    }
  }, [cards, flippedIds, checking])

  const handleRestart = () => {
    setCards(createMemoryDeck()); setFlippedIds([]); setMoves(0)
    setChecking(false); setShowConfetti(false); setVictory(false)
  }

  const totalPairs = MEMORY_EMOJIS.length

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
      <Confetti active={showConfetti} duration={3000} />

      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="p-2.5 rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </motion.button>
        <div className="flex-1"><h1 className="text-xl font-bold text-[var(--color-text)]">🃏 记忆翻牌</h1></div>
        <div className="flex items-center gap-4 px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-[var(--color-text-muted)]">步数: <span className="text-[var(--color-text)] font-bold text-sm">{moves}</span></span>
          <span className="text-xs text-[var(--color-text-muted)]">配对: <span className="font-bold text-sm" style={{ color: '#FF6B9D' }}>{matchedCount / 2}/{totalPairs}</span></span>
        </div>
      </div>

      {victory && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-5 panel rounded-3xl">
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }} className="text-5xl mb-2">🎉</motion.div>
          <h2 className="text-lg font-bold text-[var(--color-text)]">星座连线完成！</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            你用了 <span className="font-bold text-lg" style={{ color: '#FF6B9D' }}>{moves}</span> 步
          </p>
          <div className="mt-4">
            <motion.button whileTap={{ scale: 0.94 }} onClick={handleRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-white"
              style={{ background: '#FF6B9D', boxShadow: '0 0 16px rgba(255,107,157,0.3)' }}>
              <RotateCcw size={16} />再来一局
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-4 gap-2.5 max-w-[360px] mx-auto">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            whileTap={!card.flipped && !card.matched ? { scale: 0.9 } : {}}
            onClick={() => handleCardClick(card.id)}
            disabled={card.flipped || card.matched || checking}
            className="aspect-square cursor-pointer disabled:cursor-default"
            style={{ perspective: '800px' }}
          >
            <motion.div
              animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Back — dark with star pattern */}
              <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center transition-all ${
                  card.flipped || card.matched ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                style={{
                  backfaceVisibility: 'hidden',
                  background: 'linear-gradient(135deg, rgba(26,16,64,0.9), rgba(15,15,46,0.95))',
                  border: '1px solid rgba(255,107,157,0.2)',
                  boxShadow: '0 0 8px rgba(255,107,157,0.1)',
                }}
              >
                <Star size={16} fill="rgba(255,107,157,0.4)" color="rgba(255,107,157,0.4)" />
              </div>

              {/* Front */}
              <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center text-3xl transition-all ${
                  card.flipped || card.matched ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                style={{
                  backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                  background: card.matched
                    ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(74,222,128,0.05))'
                    : 'linear-gradient(135deg, rgba(15,15,46,0.9), rgba(26,16,64,0.9))',
                  border: card.matched ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,107,157,0.2)',
                  boxShadow: card.matched ? '0 0 16px rgba(74,222,128,0.2)' : 'none',
                }}
              >
                <motion.span animate={card.matched ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.5 }}>
                  {card.emoji}
                </motion.span>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>

      {!victory && (
        <div className="flex justify-center pt-2">
          <motion.button whileTap={{ scale: 0.94 }} onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: '#6A6A8A' }}>
            <RotateCcw size={14} />重新开始
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Quiz Game
   ────────────────────────────────────────────────── */

function QuizGame({ onBack, addToast }: {
  onBack: () => void
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'love') => void
}) {
  const [questions] = useState(() => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10)
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [finished, setFinished] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100

  const handleAnswer = (idx: number) => {
    if (answered) return
    setSelectedAnswer(idx); setAnswered(true)
    if (idx === currentQuestion.correctIndex) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1); setSelectedAnswer(null); setAnswered(false)
    } else {
      const finalScore = score + (selectedAnswer === currentQuestion.correctIndex ? 1 : 0)
      setScore(finalScore); setFinished(true)
      if (finalScore >= 5) setShowConfetti(true)
    }
  }

  const getRating = (s: number) => {
    if (s >= 8) return { emoji: '🏆', text: '星际大师', desc: '你真的很了解TA！', color: '#FFD700' }
    if (s >= 5) return { emoji: '💪', text: '还需要多探索', desc: '再加把劲，多关注TA吧！', color: '#60A5FA' }
    return { emoji: '💝', text: '继续加油', desc: '多花点时间了解彼此吧！', color: '#FF6B9D' }
  }

  if (finished) {
    const rating = getRating(score)
    return (
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
        <Confetti active={showConfetti} duration={3000} />
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0], y: [0, -10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-8xl mb-6">{rating.emoji}</motion.div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">问答结束！</h2>
          <div className="panel px-8 py-4 mb-4">
            <p className="text-5xl font-black text-glow">{score}/{questions.length}</p>
          </div>
          <p className="text-lg font-bold mb-1" style={{ color: rating.color }}>{rating.text}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{rating.desc}</p>
          <div className="mt-6 flex gap-3">
            <motion.button whileTap={{ scale: 0.94 }} onClick={onBack}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)', color: '#6A6A8A' }}>
              返回列表
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="p-2.5 rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </motion.button>
        <div className="flex-1"><h1 className="text-xl font-bold text-[var(--color-text)]">💝 默契问答</h1></div>
        <div className="px-3 py-1.5 rounded-xl"
          style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs text-[var(--color-text-muted)]">得分: <span className="font-bold text-sm" style={{ color: '#FF6B9D' }}>{score}</span></span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF6B9D, #C084FC)' }}
            initial={{ width: `${(currentIndex / questions.length) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }} />
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center font-medium">
          第 {currentIndex + 1} / {questions.length} 题
        </p>
      </div>

      {/* Question card */}
      <motion.div key={currentIndex}
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className="panel p-6"
      >
        <p className="text-lg font-bold text-[var(--color-text)] text-center mb-6 leading-relaxed break-word">
          {currentQuestion.question}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => {
            let bg = 'rgba(15,15,46,0.8)'; let border = '1px solid rgba(255,255,255,0.08)'
            if (answered) {
              if (idx === currentQuestion.correctIndex) {
                bg = 'rgba(74,222,128,0.1)'; border = '1px solid rgba(74,222,128,0.4)'
              } else if (idx === selectedAnswer) {
                bg = 'rgba(255,68,112,0.1)'; border = '1px solid rgba(255,68,112,0.4)'
              } else { bg = 'rgba(15,15,46,0.3)'; border = '1px solid rgba(255,255,255,0.03)' }
            }
            return (
              <motion.button
                key={idx}
                whileTap={answered ? {} : { scale: 0.97 }}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className="w-full p-4 rounded-2xl text-left transition-all cursor-pointer disabled:cursor-default flex items-center gap-3"
                style={{ background: bg, border, opacity: answered && idx !== currentQuestion.correctIndex && idx !== selectedAnswer ? 0.4 : 1 }}
              >
                <span className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: answered && idx === currentQuestion.correctIndex
                      ? 'rgba(74,222,128,0.5)' : answered && idx === selectedAnswer
                        ? 'rgba(255,68,112,0.5)' : 'rgba(255,107,157,0.12)',
                    color: answered ? '#fff' : '#FF6B9D',
                  }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-semibold text-[var(--color-text)] flex-1">{option}</span>
                {answered && idx === currentQuestion.correctIndex && (
                  <CheckIcon />
                )}
                {answered && idx === selectedAnswer && idx !== currentQuestion.correctIndex && (
                  <XIcon />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
          <motion.button whileTap={{ scale: 0.94 }} onClick={handleNext}
            className="px-8 py-3 rounded-2xl text-sm font-bold cursor-pointer text-white"
            style={{ background: '#FF6B9D', boxShadow: '0 0 16px rgba(255,107,157,0.3)' }}>
            {currentIndex < questions.length - 1 ? '下一题' : '看结果'}
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Tic-Tac-Toe Game
   ────────────────────────────────────────────────── */

function TicTacToeGame({ onBack, addToast }: {
  onBack: () => void
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'love') => void
}) {
  const [board, setBoard] = useState<TTTCell[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<TTTPlayer>('❤️')
  const [winner, setWinner] = useState<TTTCell | 'draw' | null>(null)
  const [winningLine, setWinningLine] = useState<number[] | null>(null)
  const [scoreX, setScoreX] = useState(0)
  const [scoreO, setScoreO] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const checkWinner = useCallback((b: TTTCell[]): { winner: TTTCell | 'draw' | null; line: number[] | null } => {
    for (const combo of WINNING_COMBOS) {
      const [a, bi, c] = combo
      if (b[a] && b[a] === b[bi] && b[a] === b[c]) return { winner: b[a], line: combo }
    }
    if (b.every((cell) => cell !== null)) return { winner: 'draw', line: null }
    return { winner: null, line: null }
  }, [])

  const handleCellClick = (idx: number) => {
    if (board[idx] || winner) return
    const newBoard = [...board]; newBoard[idx] = currentPlayer; setBoard(newBoard)
    const result = checkWinner(newBoard)
    if (result.winner) {
      setWinner(result.winner); setWinningLine(result.line)
      if (result.winner === '❤️') { setScoreX((s) => s + 1); setShowConfetti(true); addToast('❤️ 获胜！', 'love') }
      else if (result.winner === '⭐') { setScoreO((s) => s + 1); setShowConfetti(true); addToast('⭐ 获胜！', 'love') }
      else if (result.winner === 'draw') addToast('🤝 平局！', 'info')
    } else { setCurrentPlayer((p) => (p === '❤️' ? '⭐' : '❤️')) }
  }

  const handleRestart = () => {
    setBoard(Array(9).fill(null)); setCurrentPlayer('❤️')
    setWinner(null); setWinningLine(null); setShowConfetti(false)
  }

  const isWinningCell = (idx: number) => winningLine?.includes(idx) ?? false

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
      <Confetti active={showConfetti} duration={2500} />

      <div className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          className="p-2.5 rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(20,20,50,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <ArrowLeft size={20} className="text-[var(--color-text-muted)]" />
        </motion.button>
        <div className="flex-1"><h1 className="text-xl font-bold text-[var(--color-text)]">⭕ 星战井字棋</h1></div>
      </div>

      {/* Score */}
      <div className="panel p-4">
        <div className="flex items-center justify-around">
          <div className="text-center flex-1">
            <motion.span
              animate={currentPlayer === '❤️' && !winner ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl inline-block" style={{ filter: 'drop-shadow(0 0 8px rgba(255,68,112,0.4))' }}>❤️</motion.span>
            <p className="text-xl font-black text-[var(--color-text)] mt-0.5">{scoreX}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{currentPlayer === '❤️' && !winner ? '当前回合' : ''}</p>
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-xs font-bold text-[var(--color-text-muted)]">VS</span>
            <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.1)' }} />
          </div>
          <div className="text-center flex-1">
            <motion.span
              animate={currentPlayer === '⭐' && !winner ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl inline-block" style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.4))' }}>⭐</motion.span>
            <p className="text-xl font-black text-[var(--color-text)] mt-0.5">{scoreO}</p>
            <p className="text-[10px] text-[var(--color-text-muted)]">{currentPlayer === '⭐' && !winner ? '当前回合' : ''}</p>
          </div>
        </div>
      </div>

      {winner && (
        <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="text-center py-3 panel rounded-2xl">
          <p className="text-lg font-bold text-[var(--color-text)]">
            {winner === 'draw' ? '🤝 平局！' : `${winner} 获胜！`}
          </p>
        </motion.div>
      )}

      {/* Board */}
      <div className="relative max-w-[300px] mx-auto">
        <div className="panel p-3.5">
          <div className="relative grid grid-cols-3 gap-2">
            {board.map((cell, idx) => (
              <motion.button
                key={idx}
                whileTap={cell || winner ? {} : { scale: 0.9 }}
                onClick={() => handleCellClick(idx)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all cursor-pointer`}
                style={{
                  background: isWinningCell(idx)
                    ? 'rgba(255,215,0,0.12)'
                    : cell ? 'rgba(20,20,50,0.6)' : 'rgba(15,15,46,0.8)',
                  border: isWinningCell(idx)
                    ? '1px solid rgba(255,215,0,0.4)'
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isWinningCell(idx) ? '0 0 12px rgba(255,215,0,0.2)' : 'none',
                }}
                disabled={!!cell || !!winner}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      key={cell + idx}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 30 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Win line */}
          <AnimatePresence>
            {winningLine && winner && winner !== 'draw' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <motion.line
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    stroke="#FF6B9D" strokeWidth="5" strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(255,107,157,0.5))' }}
                    {...(WIN_LINE_COORDS[winningLine.sort().join(',')] || { x1: 10, y1: 50, x2: 90, y2: 50 })}
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!winner && (
        <p className="text-center text-sm text-[var(--color-text-muted)] font-medium">
          当前回合: <span className="font-bold text-[var(--color-text)]">{currentPlayer}</span>
        </p>
      )}

      <div className="flex justify-center pt-1">
        <motion.button whileTap={{ scale: 0.94 }} onClick={handleRestart}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(255,107,157,0.12), rgba(192,132,252,0.1))',
            border: '1px solid rgba(255,107,157,0.15)',
            color: '#FF6B9D',
          }}>
          <RotateCcw size={16} />再来一局
        </motion.button>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Inline icons
   ────────────────────────────────────────────────── */

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF4470" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}
