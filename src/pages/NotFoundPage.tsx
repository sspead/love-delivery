// ============================================================
// 恋爱外卖 NotFoundPage — 404 页面
// 淡粉背景 · 水晶3D数字 · 简洁设计
// ============================================================
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#FFF0F4]">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {['💕', '🌸', '✨', '💗', '🎀'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute select-none text-xl"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i * 18) % 70}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.15, 0.35, 0.15],
              rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* 主内容 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10"
      >
        {/* 装饰图标 */}
        <motion.div
          animate={{ rotate: [0, -8, 8, -4, 0], scale: [1, 1.05, 0.95, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
          style={{
            background: 'rgba(255,123,156,0.08)',
            border: '1px solid rgba(255,123,156,0.12)',
          }}
        >
          <span className="text-4xl select-none">&#x1F495;</span>
        </motion.div>

        {/* ★ 水晶3D 404 ★ */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="crystal-text text-6xl text-[#FF7B9C] mb-3"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg font-semibold text-[#3D2647] mb-2"
        >
          哎呀，这个页面不存在
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#A090A3] mb-8 max-w-xs mx-auto leading-relaxed"
        >
          这里好像还没有上架这个商品哦
          <br />
          回首页看看其他甜蜜选择吧 &#x2764;&#xFE0F;
        </motion.p>

        {/* 返回首页按钮 */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-medium cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #FF7B9C, #FFA940)',
            boxShadow: '0 4px 20px rgba(255,123,156,0.3)',
          }}
        >
          <span>&#x1F3E0;</span>
          <span>返回首页</span>
        </motion.button>
      </motion.div>
    </div>
  )
}
