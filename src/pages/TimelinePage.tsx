import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, Image, X, Send, Sparkles, Clock, Smile, Star } from 'lucide-react'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { Skeleton } from '../components/ui/Skeleton'
import { MOODS } from '../config/constants'
import { formatRelativeTime } from '../lib/dates'
import type { TimelinePost } from '../lib/database.types'

const TIMELINE_KEY = 'demo_timeline'
const DEMO_KEY = 'demo_mode'

function isDemoMode(): boolean {
  return localStorage.getItem(DEMO_KEY) === 'true'
}

function getStoredTimeline(): TimelinePost[] {
  try {
    return JSON.parse(localStorage.getItem(TIMELINE_KEY) || '[]')
  } catch {
    return []
  }
}

function saveTimeline(posts: TimelinePost[]) {
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(posts))
}

/* ──────────────────────────────────────────────────
   Create Post Modal
   ────────────────────────────────────────────────── */

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (post: TimelinePost) => void
}

function CreatePostModal({ open, onClose, onSubmit }: CreatePostModalProps) {
  const { profile } = useCoupleStore()
  const { addToast } = useUIStore()

  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const resetForm = () => {
    setContent('')
    setMood(null)
    setImageUrl('')
    setImageUrls([])
    setSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAddImage = () => {
    const url = imageUrl.trim()
    if (!url) return
    if (imageUrls.length >= 4) {
      addToast('最多添加4张图片 ✦', 'info')
      return
    }
    setImageUrls((prev) => [...prev, url])
    setImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!content.trim()) {
      addToast('请输入动态内容 ✦', 'error')
      return
    }

    setSubmitting(true)

    const newPost: TimelinePost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      couple_id: 'demo-couple',
      author_id: profile?.id || 'demo-user-1',
      content: content.trim(),
      image_urls: imageUrls,
      mood: mood,
      created_at: new Date().toISOString(),
    }

    onSubmit(newPost)
    addToast('动态发布成功！🌟', 'love')
    handleClose()
  }

  const characterCount = content.length

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
              <div className="flex items-center gap-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FF6B9D, #C084FC)', boxShadow: '0 0 16px rgba(255,107,157,0.3)' }}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">记录星光</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">在星座上刻下这一刻</p>
                </div>
              </div>

              {/* Content textarea */}
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="记录此刻的星光瞬间..."
                  rows={4}
                  maxLength={500}
                  className="w-full p-4 rounded-2xl text-sm resize-none outline-none transition-all duration-300 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                  style={{
                    background: 'rgba(15,15,46,0.8)',
                    border: content ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: content ? '0 0 12px rgba(255,107,157,0.08)' : 'none',
                  }}
                />
                <div className="flex items-center justify-between mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                    <Smile size={12} />
                    分享你的心情
                  </span>
                  <span className={`text-xs font-medium ${
                    characterCount > 450 ? 'text-heart' : 'text-[var(--color-text-muted)]'
                  }`}>
                    {characterCount}/500
                  </span>
                </div>
              </div>

              {/* Mood selector */}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-1.5">
                  <Smile size={16} style={{ color: '#FF6B9D' }} />
                  今日心情
                </p>
                <div className="flex gap-2">
                  {MOODS.map((m) => {
                    const isSelected = mood === m.value
                    return (
                      <motion.button
                        key={m.value}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMood(isSelected ? null : m.value)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl transition-all duration-300 cursor-pointer relative ${
                          isSelected ? 'scale-105' : ''
                        }`}
                        style={{
                          background: isSelected ? 'rgba(255,107,157,0.12)' : 'rgba(20,20,50,0.5)',
                          border: isSelected ? '1px solid rgba(255,107,157,0.4)' : '1px solid rgba(255,255,255,0.06)',
                          boxShadow: isSelected ? '0 0 16px rgba(255,107,157,0.2)' : 'none',
                        }}
                      >
                        <motion.span
                          className="text-2xl"
                          animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                          {m.emoji}
                        </motion.span>
                        <span className={`text-[10px] font-medium ${
                          isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
                        }`}>
                          {m.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Image URL input */}
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-3 flex items-center gap-1.5">
                  <Image size={16} style={{ color: '#FF6B9D' }} />
                  添加图片 <span className="text-[var(--color-text-muted)] font-normal">（可选，最多4张）</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImage() } }}
                    placeholder="粘贴图片URL..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                    style={{
                      background: 'rgba(15,15,46,0.8)',
                      border: imageUrl ? '1px solid rgba(255,107,157,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: imageUrl ? '0 0 8px rgba(255,107,157,0.06)' : 'none',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddImage}
                    disabled={!imageUrl.trim()}
                    className="px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      background: 'rgba(192,132,252,0.12)',
                      border: '1px solid rgba(192,132,252,0.2)',
                      color: '#C084FC',
                    }}
                  >
                    <Plus size={15} />
                    添加
                  </motion.button>
                </div>

                {/* Image previews */}
                <AnimatePresence>
                  {imageUrls.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 mt-3 overflow-x-auto pb-1"
                    >
                      {imageUrls.map((url, index) => (
                        <motion.div
                          key={`${index}-${url.slice(0, 20)}`}
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          className="relative shrink-0 group"
                        >
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] group-hover:border-[rgba(255,107,157,0.3)] transition-all">
                            <img src={url} alt={`预览 ${index + 1}`} className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect fill="%231a1040" width="80" height="80"/></svg>' }}
                            />
                          </div>
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md"
                            style={{ background: '#FF6B9D', color: '#fff' }}>
                            {index + 1}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-heart text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={12} />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
                  boxShadow: '0 0 20px rgba(255,107,157,0.3)',
                }}
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <Send size={18} />
                    发布动态
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ──────────────────────────────────────────────────
   Post Card
   ────────────────────────────────────────────────── */

interface PostCardProps {
  post: TimelinePost
  index: number
}

function PostCard({ post, index }: PostCardProps) {
  const { profile } = useCoupleStore()
  const [showHeart, setShowHeart] = useState(false)
  const [heartAnimKey, setHeartAnimKey] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const isOwn = isDemoMode() && post.author_id === (profile?.id || 'demo-user-1')
  const authorName = isOwn ? (profile?.display_name || '我') : 'TA'
  const authorLabel = isOwn ? '我' : 'TA'
  const moodEmoji = MOODS.find((m) => m.value === post.mood)?.emoji

  const handleDoubleTap = useCallback(() => {
    setHeartAnimKey((k) => k + 1)
    setShowHeart(true)
    setIsLiked(true)
    setTimeout(() => setShowHeart(false), 1200)
  }, [])

  let tapTimer = 0
  const handleTap = () => {
    const now = Date.now()
    if (now - tapTimer < 300) {
      handleDoubleTap()
    }
    tapTimer = now
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleTap}
      className="relative group"
    >
      <div className="panel p-5 relative overflow-hidden">
        {/* Star dot at top-left — constellation point */}
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-3 left-3 w-2 h-2 rounded-full z-10"
          style={{ background: '#FFD700', boxShadow: '0 0 6px #FFD700, 0 0 12px rgba(255,215,0,0.4)' }}
        />

        {/* Double-tap heart animation */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              key={heartAnimKey}
              initial={{ opacity: 0, scale: 0.2 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <motion.span
                animate={{ scale: [1, 1.6, 1], y: [0, -30, -10], opacity: [1, 1, 0] }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="text-6xl"
              >
                ❤️
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top glow line */}
        <div className="absolute top-0 left-6 right-6 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,107,157,0.3), transparent)' }} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{
              background: isOwn
                ? 'linear-gradient(135deg, #FF6B9D, #C084FC)'
                : 'linear-gradient(135deg, #4ADE80, #60A5FA)',
              boxShadow: isOwn ? '0 0 12px rgba(255,107,157,0.3)' : '0 0 12px rgba(74,222,128,0.2)',
            }}
          >
            {authorName[0]}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--color-text)]">{authorName}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isOwn ? 'rgba(255,107,157,0.15)' : 'rgba(74,222,128,0.15)',
                  color: isOwn ? '#FF6B9D' : '#4ADE80',
                }}>
                {authorLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock size={11} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">{formatRelativeTime(post.created_at)}</span>
            </div>
          </div>

          {moodEmoji && (
            <motion.div whileHover={{ scale: 1.15 }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full"
              style={{ background: 'rgba(20,20,50,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-base">{moodEmoji}</span>
            </motion.div>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <div className="mb-3">
            <p className="text-[15px] text-[var(--color-text-soft)] leading-relaxed whitespace-pre-wrap break-word line-clamp-3">
              {post.content}
            </p>
          </div>
        )}

        {/* Images */}
        {post.image_urls && post.image_urls.length > 0 && (
          <div className={`grid gap-2 mt-3 mb-1 ${
            post.image_urls.length === 1 ? 'grid-cols-1' : post.image_urls.length === 2 ? 'grid-cols-2'
            : post.image_urls.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
          }`}>
            {post.image_urls.map((url, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] ${
                  post.image_urls!.length === 1 ? 'max-h-72' : 'aspect-square'
                }`}
              >
                <img src={url} alt={`图片 ${i + 1}`} className="w-full h-full object-cover" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect fill="%231a1040" width="200" height="200"/></svg>' }}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <motion.div
            whileTap={{ scale: 1.3 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsLiked(!isLiked)
              if (!isLiked) { setHeartAnimKey((k) => k + 1); setShowHeart(true); setTimeout(() => setShowHeart(false), 1200) }
            }}
            className="flex items-center gap-1.5 cursor-pointer group/like"
          >
            <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart size={18} className={`transition-all duration-300 ${
                isLiked ? 'fill-heart text-heart' : 'text-[var(--color-text-muted)] group-hover/like:text-heart/60'
              }`} />
            </motion.div>
            <span className={`text-xs transition-colors ${isLiked ? 'text-heart font-medium' : 'text-[var(--color-text-muted)]'}`}>
              {isLiked ? '已点赞' : '点赞'}
            </span>
          </motion.div>
          <span className="text-xs text-[var(--color-text-muted)]">双击卡片也可以点赞 ✦</span>
        </div>

        {/* Corner decoration */}
        <div className="absolute -top-3 -right-3 pointer-events-none">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
            <Sparkles size={20} style={{ color: 'rgba(255,215,0,0.25)' }} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Timeline Feed
   ────────────────────────────────────────────────── */

function TimelineFeed() {
  const [posts, setPosts] = useState<TimelinePost[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(() => {
    if (!isDemoMode()) { setPosts([]); setLoading(false); return }
    const stored = getStoredTimeline()
    stored.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setPosts(stored)
    setLoading(false)
  }, [])

  useEffect(() => { loadPosts() }, [loadPosts])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center relative"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-8 text-5xl opacity-30"
          >⭐</motion.div>
          <motion.div
            animate={{ y: [0, -25, 0], x: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-20 right-10 text-4xl opacity-25"
          >🌟</motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute bottom-20 left-1/3 text-3xl opacity-20"
          >💫</motion.div>
          <motion.div
            animate={{ y: [0, -18, 0], x: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            className="absolute bottom-10 right-1/4 text-4xl opacity-25"
          >🌙</motion.div>
        </div>

        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10"
        >
          <div className="text-7xl mb-6">⭐</div>
        </motion.div>
        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2 relative z-10">
          还没有星座记忆
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs relative z-10 leading-relaxed">
          记录你们的第一个星光瞬间
          <br />
          点击右下角的 + 开始吧
        </p>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-8 text-[var(--color-text-muted)] relative z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main Page — 记忆星座
   ────────────────────────────────────────────────── */

export default function TimelinePage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [feedKey, setFeedKey] = useState(0)
  const { profile, loading } = useCoupleStore()

  const handlePostCreated = useCallback((newPost: TimelinePost) => {
    if (!isDemoMode()) return
    const posts = getStoredTimeline()
    posts.push(newPost)
    saveTimeline(posts)
    setFeedKey((k) => k + 1)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="panel p-5">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-11 h-11 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-6 relative px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5 }}
        className="pt-2 pb-5"
      >
        <div className="relative inline-block">
          <h1 className="text-4xl font-bold tracking-wide font-[var(--font-display)]">
            <span className="text-glow">记忆星座</span>
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="h-[3px] rounded-full mt-1 origin-left"
            style={{
              background: 'linear-gradient(90deg, #FF6B9D, #C084FC, #FFD700)',
              backgroundSize: '200% 100%',
              animation: 'gradientShift 3s ease infinite',
            }}
          />
          <motion.span
            animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1 -right-7 text-lg"
          >✦</motion.span>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mt-2 ml-1">
          每一个瞬间，都是一颗星星 ⋆
        </p>

        {/* Decorative constellation dots */}
        <div className="flex gap-2 mt-3 ml-1">
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
            className="w-2 h-2 rounded-full" style={{ background: '#FF6B9D', boxShadow: '0 0 6px #FF6B9D' }} />
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            className="w-2 h-2 rounded-full" style={{ background: '#C084FC', boxShadow: '0 0 6px #C084FC' }} />
          <motion.div animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="w-2 h-2 rounded-full" style={{ background: '#FFD700', boxShadow: '0 0 6px #FFD700' }} />
        </div>
      </motion.div>

      {/* Feed */}
      <TimelineFeed key={feedKey} />

      {/* Space for FAB */}
      <div className="h-20" />

      {/* Create Post FAB — glowing circle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, stiffness: 260, delay: 0.3 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-4 z-30 flex items-center justify-center cursor-pointer"
        style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
          boxShadow: '0 0 24px rgba(255,107,157,0.5), 0 0 48px rgba(192,132,252,0.3)',
        }}
      >
        <Plus size={28} strokeWidth={2.5} className="text-white" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-1 rounded-full border-2 border-[rgba(255,255,255,0.15)]"
        />
      </motion.button>

      {/* Create Post Modal */}
      <CreatePostModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handlePostCreated} />
    </motion.div>
  )
}
