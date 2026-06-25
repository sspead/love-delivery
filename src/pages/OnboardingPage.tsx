// ============================================================
// 恋爱外卖 OnboardingPage — 新用户引导页
// 淡粉背景 · 水晶3D标题 · 创建空间 + 邀请伴侣
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../App'
import { COUPLE_CODE_LENGTH } from '../config/constants'

// ============================================================
// 生成配对码
// ============================================================

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = ''
  for (let i = 0; i < COUPLE_CODE_LENGTH; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ============================================================
// 背景装饰
// ============================================================

function BackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {['💕', '💝', '🌸', '✨', '💗', '🎀', '💌', '💐'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute select-none text-lg"
          style={{
            left: `${5 + i * 12}%`,
            top: `${8 + (i * 13) % 80}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.15, 0.35, 0.15],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
          }}
          transition={{
            duration: 3 + i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================
// 步骤指示器
// ============================================================

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center">
          <motion.div
            animate={{ scale: current === i ? 1.2 : 1 }}
            className="rounded-full"
            style={{
              width: i <= current ? 12 : 8,
              height: i <= current ? 12 : 8,
              background:
                i <= current
                  ? 'linear-gradient(135deg, #FF7B9C, #FFA940)'
                  : '#FFB8CD',
              boxShadow:
                i <= current
                  ? '0 0 12px rgba(255,123,156,0.35)'
                  : 'none',
            }}
          />
          {i < total - 1 && (
            <div
              className="h-0.5 mx-1 rounded-full transition-all duration-500"
              style={{
                width: current > i ? 40 : 24,
                background:
                  current > i
                    ? 'linear-gradient(90deg, #FF7B9C, #FFA940)'
                    : '#FFB8CD',
                opacity: current > i ? 0.6 : 0.3,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// OnboardingPage 主组件
// ============================================================

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [coupleName, setCoupleName] = useState('我们的恋爱空间')
  const [coupleCode, setCoupleCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { updateProfile } = useAuth()

  const canProceed = displayName.trim().length > 0

  // 创建空间
  const handleCreate = useCallback(async () => {
    if (!canProceed) return
    setLoading(true)

    const code = generateCode()
    setCoupleCode(code)

    // 模拟延迟
    await new Promise((r) => setTimeout(r, 800))

    // 存储演示数据
    const coupleData = {
      id: `couple-${Date.now()}`,
      code,
      name: coupleName.trim(),
      user1: displayName.trim(),
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('demo_couple_data', JSON.stringify(coupleData))

    setLoading(false)
    setStep(1)
  }, [canProceed, coupleName, displayName])

  // 复制配对码
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(coupleCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [coupleCode])

  // 完成引导
  const handleFinish = useCallback(() => {
    updateProfile({ displayName, onboardingComplete: true, coupleCode })
    // 导航到首页
    window.location.href = '/'
  }, [updateProfile, displayName, coupleCode])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#FFF0F4]">
      <BackgroundDecor />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, #FF7B9C, #FFB8CD)',
              boxShadow: '0 4px 16px rgba(255,123,156,0.2)',
            }}
          >
            &#x2764;&#xFE0F;
          </div>
        </motion.div>

        {/* 步骤指示器 */}
        <StepIndicator current={step} total={2} />

        <AnimatePresence mode="wait">
          {step === 0 ? (
            /* ========== 步骤1：创建空间 ========== */
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FF7B9C, #FFA940)',
                    boxShadow: '0 0 24px rgba(255,123,156,0.25)',
                  }}
                >
                  <span className="text-2xl">&#x2728;</span>
                </motion.div>
                <h2 className="crystal-text-sm text-2xl text-[#3D2647]">创建我们的外卖小铺</h2>
                <p className="text-sm text-[#6B5B6E] mt-2">先给你的恋爱小铺起个名字吧</p>
              </div>

              {/* 表单卡片 */}
              <div className="food-card rounded-2xl p-5 space-y-4">
                {/* 你的昵称 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3D2647] mb-2">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF5F8] flex items-center justify-center text-xs">&#x1F464;</span>
                    你的昵称
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="输入你的昵称"
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-xl text-sm
                      bg-[#FFF5F8] border border-[#FFB8CD]/30
                      text-[#3D2647] placeholder:text-[#A090A3]
                      focus:border-[#FF7B9C] focus:outline-none focus:ring-4 focus:ring-[#FF7B9C]/10
                      transition-all duration-200"
                  />
                </div>

                {/* 空间名称 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#3D2647] mb-2">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF5F8] flex items-center justify-center text-xs">&#x1F3E0;</span>
                    空间名称
                  </label>
                  <input
                    type="text"
                    value={coupleName}
                    onChange={(e) => setCoupleName(e.target.value)}
                    placeholder="我们的恋爱空间"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl text-sm
                      bg-[#FFF5F8] border border-[#FFB8CD]/30
                      text-[#3D2647] placeholder:text-[#A090A3]
                      focus:border-[#FF7B9C] focus:outline-none focus:ring-4 focus:ring-[#FF7B9C]/10
                      transition-all duration-200"
                  />
                </div>

                {/* 创建按钮 */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreate}
                  disabled={!canProceed || loading}
                  className="relative w-full py-3.5 rounded-xl text-white font-semibold text-sm
                    flex items-center justify-center gap-2 overflow-hidden
                    disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                    transition-all duration-300"
                  style={{
                    background: canProceed
                      ? 'linear-gradient(135deg, #FF7B9C, #FFA940)'
                      : '#FFB8CD',
                    boxShadow: canProceed
                      ? '0 4px 16px rgba(255,123,156,0.3)'
                      : 'none',
                  }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      <span className="text-base">&#x2728;</span>
                      <span>创建空间</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* 返回按钮 */}
              <button
                onClick={() => window.history.back()}
                className="mt-5 w-full py-3 text-sm text-[#A090A3] flex items-center justify-center gap-1.5 hover:text-[#6B5B6E] transition-colors cursor-pointer"
              >
                <span>&#8592;</span>
                <span>返回</span>
              </button>
            </motion.div>
          ) : (
            /* ========== 步骤2：邀请伴侣 ========== */
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 6, -6, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FFA940, #FF7B9C)',
                    boxShadow: '0 0 24px rgba(255,169,64,0.25)',
                  }}
                >
                  <span className="text-2xl">&#x1F389;</span>
                </motion.div>
                <h2 className="crystal-text-sm text-2xl text-[#3D2647]">邀请你的TA</h2>
                <p className="text-sm text-[#6B5B6E] mt-2">把这个码分享给TA，TA输入后就能加入啦</p>
              </div>

              {/* 分享卡片 */}
              <div className="food-card rounded-2xl p-5 space-y-5 text-center">
                <p className="text-sm text-[#6B5B6E] break-word">
                  把专属配对码发给你的TA &#x2728;
                </p>

                {/* 配对码展示 */}
                <motion.div
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                  className="rounded-xl p-5 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #FFF5F8, #FFF0F4)',
                    border: '1px solid rgba(255,123,156,0.12)',
                  }}
                >
                  <p className="text-xs text-[#A090A3] mb-2">专属配对码</p>
                  <p className="text-4xl font-black tracking-[0.3em] text-[#FF7B9C] font-mono break-word crystal-text-sm">
                    {coupleCode}
                  </p>
                </motion.div>

                {/* 复制按钮 */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                  style={{
                    background: copied ? 'var(--color-success)' : '#FFF5F8',
                    color: copied ? '#FFFFFF' : '#FF7B9C',
                    border: copied ? 'none' : '2px solid #FFB8CD',
                    boxShadow: copied ? '0 4px 16px rgba(82,196,26,0.3)' : 'none',
                  }}
                >
                  {copied ? (
                    <>
                      <span>&#10003;</span>
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <span>&#x1F4CB;</span>
                      <span>复制专属码</span>
                    </>
                  )}
                </motion.button>

                {/* 使用说明 */}
                <div className="rounded-xl p-4 text-left" style={{ background: '#FFF5F8' }}>
                  <p className="text-xs font-semibold text-[#3D2647] mb-2">&#x1F4A1; 使用方式</p>
                  <div className="space-y-2">
                    {[
                      '复制上面的专属码，通过微信/短信发送给对方',
                      '对方进入本应用选择"加入已有空间"',
                      '输入专属码后即可配对成功',
                    ].map((text, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 text-[#FF7B9C] bg-[#FFF0F4]">
                          {i + 1}
                        </span>
                        <p className="text-xs text-[#6B5B6E] leading-relaxed break-word">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 进入空间按钮 */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  className="relative w-full py-4 rounded-xl text-white font-semibold text-sm
                    flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #FF7B9C, #FFA940)',
                    boxShadow: '0 4px 16px rgba(255,123,156,0.25)',
                  }}
                >
                  <span className="text-base">&#x2764;&#xFE0F;</span>
                  <span>进入恋爱外卖</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
