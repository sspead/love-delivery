import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../App'

function BackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {['💕', '💝', '🌸', '✨', '💗', '🎀', '🛵', '💌'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute select-none text-xl"
          style={{ left: `${8 + i * 12}%`, top: `${10 + (i * 15) % 70}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.15, 0.4, 0.15], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { demoLogin } = useAuth()
  const navigate = useNavigate()

  const handleDemoLogin = useCallback(async () => {
    setLoading(true)
    try { await demoLogin() } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [demoLogin])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#FFF0F4]">
      <BackgroundDecor />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10 flex flex-col items-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mb-4"
        >
          <motion.div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl"
            style={{
              background: 'linear-gradient(135deg, #FF7B9C, #FFA940)',
              boxShadow: '0 8px 32px rgba(255,123,156,0.3)',
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            🛵
          </motion.div>
        </motion.div>

        {/* 水晶3D标题 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="crystal-text text-5xl leading-tight mb-2 text-[#FF7B9C]"
        >
          恋 爱 外 卖
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="text-[#6B5B6E] text-sm tracking-[0.12em] mb-12 font-medium"
        >
          甜蜜下单 · 专属送达
        </motion.p>

        {/* 按钮组 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="w-full space-y-4"
        >
          {/* 创建空间 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/onboarding')}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-3 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FF7B9C, #E8668A)',
              boxShadow: '0 6px 24px rgba(255,123,156,0.35)',
            }}
          >
            <span className="text-xl">✨</span>
            <span>创建我们的空间</span>
          </motion.button>

          {/* 加入空间 */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/join')}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 cursor-pointer border-2 border-[#FFB8CD] text-[#FF7B9C] hover:bg-[#FFF5F8] transition-colors"
          >
            <span className="text-xl">💝</span>
            <span>加入TA的空间</span>
          </motion.button>

          {/* 快速体验 */}
          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#FFD0DD]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#FFF0F4] px-4 text-xs text-[#A090A3]">或者</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl border-2 border-dashed border-[#FFB8CD] text-sm font-medium text-[#FF7B9C] flex items-center justify-center gap-2 hover:bg-[#FFF5F8] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-5 h-5 border-2 border-[#FF7B9C]/30 border-t-[#FF7B9C] rounded-full"
              />
            ) : (
              <>
                <span className="text-base">🚀</span>
                <span>快速体验（演示模式）</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.7 }}
        className="absolute bottom-8 text-xs text-[#A090A3] text-center tracking-wide"
      >
        💖 专属于两个人的甜蜜空间
      </motion.p>
    </div>
  )
}
