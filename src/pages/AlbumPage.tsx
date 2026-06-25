import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Heart, Camera, Image as ImageIcon, Trash2, Sparkles } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'
import { Confetti } from '../components/ui/Confetti'
import { useUIStore } from '../stores/uiStore'
import { useAuthStore } from '../stores/authStore'
import { useCoupleStore } from '../stores/coupleStore'

/* ──────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────── */

interface DemoPhoto {
  id: string
  storage_path: string
  caption: string | null
  uploader_id: string
  created_at: string
}

const STORAGE_KEY = 'demo_photos'

/* ──────────────────────────────────────────────────
   Gradient placeholders — dark space themed
   ────────────────────────────────────────────────── */

const GRADIENTS = [
  ['#FF6B9D', '#1A1040'],
  ['#C084FC', '#0F0F2E'],
  ['#FFD700', '#1A1040'],
  ['#4ADE80', '#0F0F2E'],
  ['#FF6B9D', '#C084FC'],
  ['#C084FC', '#FFD700'],
  ['#FFD700', '#FF6B9D'],
  ['#4ADE80', '#C084FC'],
]

const SAMPLE_CAPTIONS = [
  '我们的第一次约会 ✦',
  '最美的时光就是和你在一起 ⋆',
  '今天一起去吃了好吃的 ⭐',
  '我们的合照 🌙',
  '在一起的每一天都值得纪念 ✨',
  '你笑起来真好看 💫',
  '手牵手一起走 🌟',
  '最浪漫的事就是和你慢慢变老 🪐',
]

function generatePlaceholderPhotos(): DemoPhoto[] {
  const now = new Date()
  return GRADIENTS.slice(0, 8).map(([c1, c2], i) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400 + Math.floor(Math.random() * 200)
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.font = `${canvas.width * 0.2}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🌟', canvas.width / 2, canvas.height / 2)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    const daysAgo = i * 3 + Math.floor(Math.random() * 5)
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)

    return {
      id: `sample-${i}-${Date.now()}`,
      storage_path: dataUrl,
      caption: SAMPLE_CAPTIONS[i],
      uploader_id: 'demo-user-1',
      created_at: date.toISOString(),
    }
  })
}

/* ──────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────── */

function loadPhotos(): DemoPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DemoPhoto[]) : []
  } catch { return [] }
}

function savePhotos(photos: DemoPhoto[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
}

/* ──────────────────────────────────────────────────
   Photo Card
   ────────────────────────────────────────────────── */

function PhotoCard({ photo, onClick, onDelete }: {
  photo: DemoPhoto; onClick: () => void; onDelete?: () => void
}) {
  const [imgError, setImgError] = useState(false)
  const { user } = useAuthStore()
  const isOwner = user?.id === photo.uploader_id

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="break-inside-avoid mb-4 relative group cursor-pointer"
    >
      <div onClick={onClick} className="relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] transition-shadow hover:shadow-[0_0_16px_rgba(255,107,157,0.15)]">
        {photo.storage_path.startsWith('data:') || photo.storage_path.startsWith('http') ? (
          imgError ? (
            <div className="w-full aspect-[3/4] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(15,15,46,0.8), rgba(26,16,64,0.8))' }}>
              <ImageIcon size={48} className="text-[var(--color-text-muted)]" />
            </div>
          ) : (
            <img
              src={photo.storage_path}
              alt={photo.caption || '照片'}
              className="w-full h-auto object-cover block"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )
        ) : (
          <div className="w-full aspect-[3/4] flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(15,15,46,0.8), rgba(26,16,64,0.8))' }}>
            <ImageIcon size={48} className="text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* Caption overlay */}
        {photo.caption && (
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(to top, rgba(6,6,26,0.9), transparent)' }}>
            <p className="text-[var(--color-text)] text-sm font-medium line-clamp-2">{photo.caption}</p>
          </div>
        )}

        {/* Always visible small caption */}
        {photo.caption && (
          <div className="absolute inset-x-0 bottom-0 p-2 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'linear-gradient(to top, rgba(6,6,26,0.8), transparent)' }}>
            <p className="text-[var(--color-text)] text-xs line-clamp-1">{photo.caption}</p>
          </div>
        )}
      </div>

      {/* Delete */}
      {isOwner && onDelete && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-heart/70"
        >
          <Trash2 size={13} />
        </motion.button>
      )}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────
   Photo Viewer — full screen dark
   ────────────────────────────────────────────────── */

function PhotoViewer({ photo, open, onClose }: {
  photo: DemoPhoto | null; open: boolean; onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(6,6,26,0.98)' }}
          onClick={onClose}
        >
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}
          >
            <X size={22} className="text-[var(--color-text)]" />
          </motion.button>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="max-w-[95vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {(photo.storage_path.startsWith('data:') || photo.storage_path.startsWith('http')) ? (
              <img
                src={photo.storage_path}
                alt={photo.caption || '照片'}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-80 h-80 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(192,132,252,0.1))' }}>
                <ImageIcon size={64} className="text-[var(--color-text-muted)]" />
              </div>
            )}

            {photo.caption && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 text-center max-w-md px-4"
              >
                <p className="text-[var(--color-text)] text-lg font-medium">{photo.caption}</p>
                <p className="text-[var(--color-text-muted)] text-xs mt-2">
                  {new Date(photo.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ──────────────────────────────────────────────────
   Upload Modal
   ────────────────────────────────────────────────── */

function UploadModal({ open, onClose, onUploaded }: {
  open: boolean; onClose: () => void; onUploaded: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { user } = useAuthStore()
  const { addToast } = useUIStore()

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { addToast('请选择图片文件', 'error'); return }
    if (file.size > 10 * 1024 * 1024) { addToast('图片大小不能超过 10MB', 'error'); return }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        let { width, height } = img
        const maxWidth = 1200; const maxHeight = 1200
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio); height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        setPreview(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return; processFile(file)
  }

  const handleUpload = () => {
    if (!preview) { addToast('请选择一张图片', 'error'); return }
    setUploading(true)
    const userId = user?.id || 'demo-user-1'
    const newPhoto: DemoPhoto = {
      id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      storage_path: preview,
      caption: caption.trim() || null,
      uploader_id: userId,
      created_at: new Date().toISOString(),
    }
    const photos = loadPhotos()
    photos.unshift(newPhoto)
    savePhotos(photos)
    setTimeout(() => {
      setUploading(false); setPreview(null); setCaption('')
      addToast('🌟 照片已上传到银河相册', 'success')
      onUploaded(); onClose()
    }, 600)
  }

  const handleClose = () => { setPreview(null); setCaption(''); setDragOver(false); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0]; if (!file) return; processFile(file)
              }} className="hidden" />

              {!preview ? (
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'rgba(255,107,157,0.5)' : 'rgba(255,255,255,0.1)',
                    background: dragOver ? 'rgba(255,107,157,0.06)' : 'rgba(15,15,46,0.4)',
                  }}
                >
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1"
                      style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(192,132,252,0.1))' }}>
                      <Camera size={32} style={{ color: '#FF6B9D' }} />
                    </div>
                  </motion.div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{dragOver ? '松开即可上传' : '点击选择图片'}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">或拖拽图片到此处，支持 JPG/PNG/GIF，最大 10MB</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={preview} alt="预览" className="w-full max-h-64 object-contain"
                      style={{ background: 'rgba(15,15,46,0.8)' }} />
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center cursor-pointer"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm cursor-pointer"
                    style={{ color: '#FF6B9D' }}>重新选择</button>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">添加描述（可选）</label>
                <input
                  type="text" value={caption} onChange={(e) => setCaption(e.target.value)}
                  placeholder="记录这一刻的美好..." maxLength={100}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                  style={{ background: 'rgba(15,15,46,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 text-right">{caption.length}/100</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleUpload}
                disabled={!preview || uploading}
                className="w-full py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: preview && !uploading
                    ? 'linear-gradient(135deg, #FF6B9D, #C084FC)'
                    : 'rgba(255,255,255,0.05)',
                  color: preview && !uploading ? '#fff' : '#6A6A8A',
                  boxShadow: preview && !uploading ? '0 0 16px rgba(255,107,157,0.3)' : 'none',
                }}
              >
                {uploading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Upload size={16} />
                    上传到银河
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
   Skeleton Masonry
   ────────────────────────────────────────────────── */

function SkeletonGrid() {
  const heights = [200, 260, 180, 300, 220, 280, 240, 200]
  return (
    <div className="columns-2 sm:columns-3 gap-4 space-y-4 px-4 pt-4">
      {heights.map((h, i) => (
        <div key={i} className="break-inside-avoid mb-4">
          <div className="animate-pulse rounded-2xl" style={{ height: `${h}px`, background: 'rgba(255,255,255,0.03)' }} />
        </div>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main Page — 银河相册
   ────────────────────────────────────────────────── */

export default function AlbumPage() {
  const [photos, setPhotos] = useState<DemoPhoto[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [viewerPhoto, setViewerPhoto] = useState<DemoPhoto | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const { addToast } = useUIStore()
  const { couple } = useCoupleStore()
  const isDemo = localStorage.getItem('demo_mode') === 'true'

  useEffect(() => {
    const existing = loadPhotos()
    if (existing.length === 0 && isDemo) {
      const samples = generatePlaceholderPhotos()
      savePhotos(samples)
      setPhotos(samples)
    } else { setPhotos(existing) }
    setInitialized(true)
  }, [isDemo])

  const refreshPhotos = useCallback(() => { setPhotos(loadPhotos()) }, [])

  const handleDelete = (id: string) => {
    const updated = photos.filter((p) => p.id !== id)
    savePhotos(updated); setPhotos(updated)
    addToast('照片已删除', 'info')
  }

  const sortedPhotos = [...photos].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  if (!initialized) {
    return (
      <div className="min-h-dvh">
        <div className="sticky top-0 z-20 px-5 py-4"
          style={{ background: 'rgba(6,6,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-glow">银河相册</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">加载中...</p>
        </div>
        <SkeletonGrid />
      </div>
    )
  }

  if (sortedPhotos.length === 0) {
    return (
      <div className="min-h-dvh">
        <div className="sticky top-0 z-20 px-5 py-4"
          style={{ background: 'rgba(6,6,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            {couple?.name ? `${couple.name} 的 ` : ''}<span className="text-glow">银河相册</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">记录甜蜜星光瞬间 ✦</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="relative mb-8">
            <motion.div
              animate={{ y: [0, -15, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-8 -left-6 text-2xl"
            >✨</motion.div>
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -top-2 -right-4 text-xl"
            >💫</motion.div>
            <motion.div
              animate={{ y: [0, -12, 0], opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -bottom-3 left-2 text-lg"
            >🌟</motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.15), rgba(192,132,252,0.1))', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-5xl">📸</span>
            </motion.div>
          </div>

          <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">还没有照片</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs mb-8">
            记录你们的甜蜜瞬间，让每一份回忆都闪闪发光 ✨
          </p>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setUploadModalOpen(true)}
            className="px-8 py-3.5 rounded-2xl text-white font-medium text-sm flex items-center gap-2 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FF6B9D, #C084FC)', boxShadow: '0 0 20px rgba(255,107,157,0.3)' }}
          >
            <Camera size={18} />
            上传第一张照片
          </motion.button>
        </div>

        <UploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUploaded={refreshPhotos} />
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-4">
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 py-4 flex items-center justify-between"
        style={{ background: 'rgba(6,6,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-glow">银河相册</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">{sortedPhotos.length} 颗星光记忆 ✦</p>
        </div>
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Heart size={22} style={{ color: '#FF6B9D' }} fill="#FF6B9D" />
        </motion.div>
      </div>

      {/* Photo Grid masonry */}
      <div className="px-4 pt-4">
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          <AnimatePresence>
            {sortedPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onClick={() => setViewerPhoto(photo)}
                onDelete={() => handleDelete(photo.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.08 }}
        onClick={() => setUploadModalOpen(true)}
        className="fixed bottom-24 right-5 z-30 flex items-center justify-center cursor-pointer"
        style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B9D, #C084FC)',
          boxShadow: '0 0 24px rgba(255,107,157,0.4)',
        }}
      >
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Upload size={24} className="text-white" />
        </motion.div>
      </motion.button>

      <UploadModal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} onUploaded={() => { refreshPhotos(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3500) }} />
      <PhotoViewer photo={viewerPhoto} open={!!viewerPhoto} onClose={() => setViewerPhoto(null)} />
      <Confetti active={showConfetti} />
    </div>
  )
}
