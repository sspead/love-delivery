import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Edit3, Check, X, Copy, LogOut, Calendar, User, Users, Palette, Sparkles, Info, AlertTriangle, Crown } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCoupleStore } from '../stores/coupleStore'
import { useUIStore } from '../stores/uiStore'
import { formatFullDate } from '../lib/dates'

/* ──────────────────────────────────────────────────
   Inline Edit
   ────────────────────────────────────────────────── */

function InlineEdit({ value, onSave, placeholder, type = 'text' }: {
  value: string; onSave: (value: string) => void; placeholder?: string; type?: 'text' | 'date'
}) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(value)

  const handleSave = () => { if (temp.trim()) onSave(temp.trim()); setEditing(false) }
  const handleCancel = () => { setTemp(value); setEditing(false) }

  if (editing) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
        <input
          type={type} value={temp} onChange={(e) => setTemp(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          placeholder={placeholder} autoFocus
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none transition-colors text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
          style={{
            background: 'rgba(15,15,46,0.8)',
            border: '1px solid rgba(255,107,157,0.3)',
            boxShadow: '0 0 8px rgba(255,107,157,0.08)',
          }}
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ background: '#FF6B9D', color: '#fff' }}>
          <Check size={14} />
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#6A6A8A' }}>
          <X size={14} />
        </motion.button>
      </motion.div>
    )
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[var(--color-text)] text-sm">
        {type === 'date' && value ? formatFullDate(value) : value || placeholder || '未设置'}
      </span>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditing(true)}
        className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.05)', color: '#6A6A8A' }}>
        <Edit3 size={11} />
      </motion.button>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Section Header
   ────────────────────────────────────────────────── */

function SectionHeader({ icon: Icon, title, accent }: {
  icon: typeof Heart; title: string; accent?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: accent ? `${accent}18` : 'rgba(255,107,157,0.12)' }}>
        <Icon size={20} style={{ color: accent || '#FF6B9D' }} />
      </div>
      <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Setting Row
   ────────────────────────────────────────────────── */

function SettingRow({ icon: Icon, label, children }: {
  icon: typeof Heart; label: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Icon size={14} className="text-[var(--color-text-muted)]" />
        </div>
        <span className="text-sm text-[var(--color-text-muted)] flex-shrink-0">{label}</span>
      </div>
      <div className="max-w-[190px] text-right">{children}</div>
    </div>
  )
}

/* ──────────────────────────────────────────────────
   Main — 空间站设置
   ────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { user, signOut } = useAuthStore()
  const { profile, couple, partner } = useCoupleStore()
  const { theme, setTheme, addToast } = useUIStore()
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const isDemo = localStorage.getItem('demo_mode') === 'true'

  const handleCopyCoupleCode = async () => {
    if (!couple?.couple_code) return
    try { await navigator.clipboard.writeText(couple.couple_code) } catch {}
    setCopied(true); addToast('专属码已复制 ✦', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpdateCoupleName = (name: string) => {
    if (!couple) return
    const updated = { ...couple, name }
    useCoupleStore.getState().setCouple(updated)
    localStorage.setItem('demo_couple', JSON.stringify(updated))
    addToast('空间名称已更新 ✦', 'success')
  }

  const handleUpdateAnniversary = (date: string) => {
    if (!couple) return
    const updated = { ...couple, anniversary: date ? new Date(date).toISOString() : null }
    useCoupleStore.getState().setCouple(updated)
    localStorage.setItem('demo_couple', JSON.stringify(updated))
    addToast('纪念日已更新 ✦', 'success')
  }

  const handleLogout = async () => {
    setLogoutModalOpen(false)
    try {
      await signOut()
      if (isDemo) {
        localStorage.removeItem('demo_mode'); localStorage.removeItem('demo_user')
        localStorage.removeItem('demo_profile'); localStorage.removeItem('demo_couple')
        localStorage.removeItem('demo_couple_code'); localStorage.removeItem('demo_photos')
      }
      window.location.href = '/login'
    } catch { addToast('退出失败，请重试', 'error') }
  }

  const handleThemeChange = (newTheme: '深空' | '星云') => {
    // Map to existing theme system
    setTheme(newTheme === '星云' ? 'pink' : 'light')
    addToast(newTheme === '星云' ? '已切换到星云主题 ✨' : '已切换到深空主题 🌙', 'info')
  }

  const currentThemeDisplay = theme === 'pink' ? '星云' : '深空'

  return (
    <div className="min-h-dvh">
      {/* Header */}
      <div className="sticky top-0 z-20 px-5 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(6,6,26,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-glow">空间站设置</span>
          </h1>
          {isDemo && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700' }}>
              演示模式
            </span>
          )}
        </div>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Sparkles size={20} style={{ color: '#FFD700' }} />
        </motion.div>
      </div>

      <div className="px-5 py-6 space-y-5 pb-32">
        {/* Couple Info */}
        <div className="panel p-7">
          <SectionHeader icon={Heart} title="我们的星域" />
          <div className="divide-y divide-[rgba(255,255,255,0.06)]">
            <SettingRow icon={Users} label="空间名称">
              <InlineEdit value={couple?.name || '未命名'} onSave={handleUpdateCoupleName} placeholder="输入空间名称" />
            </SettingRow>
            <SettingRow icon={Calendar} label="纪念日">
              <InlineEdit
                value={couple?.anniversary ? new Date(couple.anniversary).toISOString().split('T')[0] : ''}
                onSave={handleUpdateAnniversary} placeholder="选择纪念日" type="date"
              />
            </SettingRow>
            <SettingRow icon={Sparkles} label="配对码">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold tracking-[0.2em] px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(255,107,157,0.12)', color: '#FF6B9D' }}>
                  {couple?.couple_code || '------'}
                </span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleCopyCoupleCode}
                  className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: copied ? 'rgba(74,222,128,0.2)' : 'rgba(255,107,157,0.12)', color: copied ? '#4ADE80' : '#FF6B9D' }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </motion.button>
              </div>
            </SettingRow>
          </div>

          {couple?.anniversary && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--color-text-muted)]">距离下个纪念日</span>
                <span className="text-xs font-medium" style={{ color: '#FF6B9D' }}>
                  {(() => {
                    const target = new Date(couple.anniversary)
                    const today = new Date()
                    const next = new Date(today.getFullYear(), target.getMonth(), target.getDate())
                    if (next <= today) next.setFullYear(next.getFullYear() + 1)
                    return `${Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))} 天`
                  })()}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #FF6B9D, #C084FC)' }} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Partner Info */}
        <div className="panel p-7">
          <SectionHeader icon={User} title="TA的信息" />
          {partner ? (
            <div className="flex items-center gap-4 rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.04), rgba(192,132,252,0.04))' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,107,157,0.2), rgba(192,132,252,0.15))', border: '1px solid rgba(255,255,255,0.08)' }}>
                {partner.avatar_url ? (
                  <img src={partner.avatar_url} alt={partner.display_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">{partner.display_name?.charAt(0) || '💕'}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--color-text)]">{partner.display_name}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>已配对</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">你们已成功连接 ✦</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <User size={24} className="text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-muted)]">等待TA加入...</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">分享配对码，邀请TA加入星域</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="panel p-7">
          <SectionHeader icon={Palette} title="主题设置" />
          <div className="grid grid-cols-2 gap-3">
            {/* 深空 theme */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeChange('深空')}
              className="relative p-4 rounded-2xl border transition-all cursor-pointer text-left overflow-hidden break-word"
              style={{
                borderColor: currentThemeDisplay === '深空' ? 'rgba(192,132,252,0.4)' : 'transparent',
                background: currentThemeDisplay === '深空' ? 'rgba(192,132,252,0.06)' : 'rgba(255,255,255,0.02)',
                boxShadow: currentThemeDisplay === '深空' ? '0 0 16px rgba(192,132,252,0.15)' : 'none',
              }}
            >
              {currentThemeDisplay === '深空' && <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(192,132,252,0.03)' }} />}
              <div className="relative">
                <div className="w-full h-14 rounded-xl mb-3" style={{
                  background: 'linear-gradient(135deg, #06061A, #0F0F2E, #1A1040)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }} />
                <p className="text-sm font-semibold text-[var(--color-text)]">深空</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">暗夜星辰主题</p>
                {currentThemeDisplay === '深空' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#C084FC', color: '#fff' }}>
                    <Check size={11} />
                  </motion.div>
                )}
              </div>
            </motion.button>

            {/* 星云 theme */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeChange('星云')}
              className="relative p-4 rounded-2xl border transition-all cursor-pointer text-left overflow-hidden break-word"
              style={{
                borderColor: currentThemeDisplay === '星云' ? 'rgba(255,107,157,0.4)' : 'transparent',
                background: currentThemeDisplay === '星云' ? 'rgba(255,107,157,0.06)' : 'rgba(255,255,255,0.02)',
                boxShadow: currentThemeDisplay === '星云' ? '0 0 16px rgba(255,107,157,0.15)' : 'none',
              }}
            >
              <div className="relative">
                <div className="w-full h-14 rounded-xl mb-3" style={{
                  background: 'linear-gradient(135deg, #FF6B9D, #C084FC, #FFD700)',
                }} />
                <p className="text-sm font-semibold text-[var(--color-text)]">星云</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">霓虹星云主题</p>
                {currentThemeDisplay === '星云' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#FF6B9D', color: '#fff' }}>
                    <Check size={11} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>
        </div>

        {/* About */}
        <div className="panel p-7">
          <SectionHeader icon={Info} title="关于" />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--color-text-muted)]">版本号</span>
              <span className="text-sm font-mono font-medium px-3 py-1 rounded-lg text-[var(--color-text)]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                v1.0.0
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--color-text-muted)]">应用名称</span>
              <span className="text-sm text-[var(--color-text)] flex items-center gap-1.5">
                星光恋爱宇宙
                <Heart size={12} style={{ color: '#FF6B9D' }} fill="#FF6B9D" />
              </span>
            </div>
            <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-xs text-[var(--color-text-muted)] text-center">
                Made with <Heart size={10} className="text-heart inline-block" fill="#FF4470" /> in the starlight ✦
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="panel p-7">
          <SectionHeader icon={Crown} title="账号信息" />
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--color-text-muted)]">昵称</span>
              <span className="text-sm font-medium text-[var(--color-text)]">
                {profile?.display_name || user?.email || '--'}
              </span>
            </div>
            {couple && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--color-text-muted)]">空间</span>
                <span className="text-sm font-medium text-[var(--color-text)]">{couple.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setLogoutModalOpen(true)}
          className="w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          style={{
            background: 'rgba(255,68,112,0.08)',
            border: '1px solid rgba(255,68,112,0.2)',
            color: '#FF4470',
          }}
        >
          <LogOut size={16} />
          退出登录
        </motion.button>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {logoutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setLogoutModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative z-10 w-full sm:max-w-md mx-2 panel-glow p-6 safe-bottom"
            >
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                  <AlertTriangle size={20} style={{ color: '#FFD700' }} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)] mb-1">确定要退出吗？</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      退出后需要重新登录才能访问你们的星域。
                      {isDemo && '演示数据将丢失。'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setLogoutModalOpen(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0C0', border: '1px solid rgba(255,255,255,0.06)' }}>
                    取消
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
                    className="flex-1 py-3 rounded-xl text-sm font-medium cursor-pointer text-white"
                    style={{ background: '#FF4470', boxShadow: '0 0 16px rgba(255,68,112,0.3)' }}>
                    确认退出
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
