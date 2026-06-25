// ============================================================
// 恋爱外卖 Header — 精简顶部导航
// 固定顶部 · 白色背景 · h-12 · 居中标题 · 铃铛通知
// ============================================================
import { useCallback } from 'react'
import { motion } from 'framer-motion'

// ============================================================
// Header 组件
// ============================================================

export function Header() {
  const handleBellClick = useCallback(() => {
    // 可选：后续接入通知面板
  }, [])

  return (
    <header className="z-30 safe-top bg-white/80 backdrop-blur-xl border-b border-black/[0.03]">
      <div className="flex items-center justify-center h-12 px-4 max-w-lg mx-auto relative">
        {/* 居中：恋爱外卖标题 */}
        <h1
          className="crystal-text-sm text-base text-center select-none"
          style={{ color: 'var(--color-text)' }}
        >
          恋爱外卖
        </h1>

        {/* 右侧：铃铛通知图标 */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleBellClick}
          className="absolute right-4 p-1.5 rounded-full hover:bg-[#FFF5F8] transition-colors cursor-pointer"
          aria-label="通知"
        >
          <span className="text-lg select-none">&#x1F514;</span>

          {/* 未读红点 */}
          <motion.span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{
              background: 'var(--color-heart)',
              boxShadow: '0 0 6px rgba(255,68,112,0.4)',
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.button>
      </div>
    </header>
  )
}
