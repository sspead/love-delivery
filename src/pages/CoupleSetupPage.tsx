// ============================================================
// 恋爱外卖 CoupleSetupPage — 加入已有空间
// 输入6位配对码 · 淡粉背景 · 水晶3D标题
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../App'
import { COUPLE_CODE_LENGTH } from '../config/constants'

// ============================================================
// 背景装饰
// ============================================================

function BackgroundDecor() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {['💕', '💝', '🌸', '✨', '💗', '🎀'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute select-none text-lg"
          style={{
            left: `${8 + i * 15}%`,
            top: `${10 + (i * 15) % 75}%`,
          }}
          animate={{
            y: [0, -18, 0],
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
// 配对码输入组件
// ============================================================

function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, COUPLE_CODE_LENGTH)
  }, [])

  const handleChange = (index: number, char: string) => {
    const cleaned = char.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (cleaned.length > 1) {
      const chars = cleaned.split('').slice(0, COUPLE_CODE_LENGTH)
      const newVal = (value + chars.join('')).split('').slice(0, COUPLE_CODE_LENGTH).join('')
      onChange(newVal)
      const next = Math.min(chars.length, COUPLE_CODE_LENGTH - 1)
      inputRefs.current[next]?.focus()
      return
    }

    const chars = value.split('')
    chars[index] = cleaned
    const newVal = chars.join('').slice(0, COUPLE_CODE_LENGTH)
    onChange(newVal)

    if (cleaned && index < COUPLE_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (value[index]) {
        const chars = value.split('')
        chars[index] = ''
        onChange(chars.join(''))
      } else if (index > 0) {
        const chars = value.split('')
        chars[index - 1] = ''
        onChange(chars.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < COUPLE_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text/plain')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, COUPLE_CODE_LENGTH)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, COUPLE_CODE_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: COUPLE_CODE_LENGTH }).map((_, index) => {
        const char = value[index] || ''
        const isFilled = !!char

        return (
          <motion.div
            key={index}
            animate={{
              scale: isFilled ? 1.05 : 1,
            }}
            className="relative w-12 h-14 rounded-xl flex items-center justify-center border-2 transition-all duration-200"
            style={{
              borderColor: isFilled ? 'var(--color-primary)' : 'rgba(255,184,205,0.4)',
              background: isFilled ? '#FFF5F8' : '#FFFFFF',
              boxShadow: isFilled
                ? '0 0 12px rgba(255,123,156,0.2)'
                : '0 1px 4px rgba(0,0,0,0.03)',
            }}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="text"
              autoComplete="off"
              maxLength={1}
              value={char}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="absolute inset-0 w-full h-full text-center text-xl font-black font-mono
                text-[#FF7B9C] bg-transparent border-none outline-none rounded-xl cursor-pointer uppercase"
            />
          </motion.div>
        )
      })}
    </div>
  )
}

// ============================================================
// CoupleSetupPage 主组件
// ============================================================

export default function CoupleSetupPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [joined, setJoined] = useState(false)
  const [partnerName, setPartnerName] = useState('')

  const { updateProfile } = useAuth()

  const codeComplete = code.length === COUPLE_CODE_LENGTH

  // 自动提交
  const prevLen = useRef(code.length)
  useEffect(() => {
    if (prevLen.current === 5 && code.length === 6) {
      const timer = setTimeout(() => handleJoin(code), 300)
      return () => clearTimeout(timer)
    }
    prevLen.current = code.length
  }, [code])

  const handleJoin = useCallback(
    async (codeToUse?: string) => {
      const codeVal = codeToUse || code
      if (codeVal.length !== COUPLE_CODE_LENGTH) return

      setLoading(true)
      setError('')

      try {
        await new Promise((r) => setTimeout(r, 1000))

        // 演示模式：检查本地存储的配对码
        const storedData = localStorage.getItem('demo_couple_data')
        if (storedData) {
          const couple = JSON.parse(storedData)
          if (couple.code === codeVal.toUpperCase()) {
            setPartnerName(couple.user1 || '你的TA')
            setJoined(true)
          } else {
            setError('未找到匹配的空间，请检查配对码是否正确')
          }
        } else {
          // 没有任何空间数据时允许任意码加入（演示宽容模式）
          setPartnerName('你的TA')
          setJoined(true)
        }
      } catch {
        setError('加入失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    },
    [code],
  )

  const handleEnter = useCallback(() => {
    updateProfile({ onboardingComplete: true })
    window.location.href = '/'
  }, [updateProfile])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#FFF0F4]">
      <BackgroundDecor />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10"
      >
        <AnimatePresence mode="wait">
          {!joined ? (
            /* ========== 加入流程 ========== */
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-6">
                {/* Logo */}
                <motion.div
                  className="flex justify-center mb-5"
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

                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] mb-4"
                  style={{
                    background: 'linear-gradient(135deg, #FFA940, #FF7B9C)',
                    boxShadow: '0 0 24px rgba(255,169,64,0.25)',
                  }}
                >
                  <span className="text-2xl">&#x1F91D;</span>
                </motion.div>
                <h2 className="crystal-text-sm text-2xl text-[#3D2647]">加入TA的空间</h2>
                <p className="text-sm text-[#6B5B6E] mt-2">
                  输入TA分享给你的 {COUPLE_CODE_LENGTH} 位专属配对码
                </p>
              </div>

              {/* 输入卡片 */}
              <div className="food-card rounded-2xl p-5 space-y-5">
                <label className="flex items-center justify-center gap-2 text-sm font-semibold text-[#3D2647] mb-2">
                  <span>&#x1F511;</span>
                  专属配对码
                </label>

                <CodeInput
                  value={code}
                  onChange={(val) => {
                    setCode(val)
                    setError('')
                  }}
                  disabled={loading}
                />

                {/* 错误 */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="flex items-center justify-center gap-2 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,68,112,0.08)',
                        border: '1px solid rgba(255,68,112,0.15)',
                      }}
                    >
                      <p className="text-xs font-medium text-[#FF4470] break-word">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 加入按钮 */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleJoin()}
                  disabled={!codeComplete || loading}
                  className="relative w-full py-3.5 rounded-xl text-white font-semibold text-sm
                    flex items-center justify-center gap-2 overflow-hidden
                    disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer
                    transition-all duration-300"
                  style={{
                    background: codeComplete
                      ? 'linear-gradient(135deg, #FFA940, #FF7B9C)'
                      : '#FFB8CD',
                    boxShadow: codeComplete
                      ? '0 4px 16px rgba(255,169,64,0.3)'
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
                      <span>加入</span>
                    </>
                  )}
                </motion.button>

                {!codeComplete && code.length > 0 && (
                  <p className="text-xs text-[#A090A3] text-center">
                    还需输入 {COUPLE_CODE_LENGTH - code.length} 位字符
                  </p>
                )}
                {code.length === 0 && (
                  <p className="text-xs text-[#A090A3] text-center">
                    输入 {COUPLE_CODE_LENGTH} 位字母或数字配对码
                  </p>
                )}
              </div>

              {/* 返回 */}
              <button
                onClick={() => window.history.back()}
                className="mt-5 w-full py-3 text-sm text-[#A090A3] flex items-center justify-center gap-1.5 hover:text-[#6B5B6E] transition-colors cursor-pointer"
              >
                <span>&#8592;</span>
                <span>返回</span>
              </button>
            </motion.div>
          ) : (
            /* ========== 成功页面 ========== */
            <motion.div
              key="success"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.1 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                  style={{
                    background: 'rgba(82,196,26,0.1)',
                    border: '2px solid rgba(82,196,26,0.2)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-4xl"
                  >
                    &#10003;
                  </motion.div>
                </motion.div>
                <h2 className="crystal-text-sm text-2xl text-[#3D2647]">加入成功</h2>
                <p className="text-sm text-[#6B5B6E] mt-2 break-word">
                  {partnerName} 已经在等你啦 &#x1F389;
                </p>
              </div>

              {/* 庆祝卡片 */}
              <div className="food-card rounded-2xl p-5 space-y-5 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.3 }}
                  className="text-5xl flex justify-center"
                >
                  <motion.span
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  >
                    &#x1F389;
                  </motion.span>
                </motion.div>

                <div className="rounded-xl p-4 text-left" style={{ background: '#FFF5F8' }}>
                  <p className="text-sm text-[#3D2647] leading-relaxed break-word">
                    你和{' '}
                    <span className="font-bold text-[#FF7B9C]">{partnerName}</span>{' '}
                    已经成功配对啦
                  </p>
                  <p className="text-xs text-[#6B5B6E] mt-2.5 leading-relaxed break-word">
                    现在可以一起下单恋爱商品，享受甜蜜互动了 &#x2728;
                  </p>
                </div>

                <div className="flex justify-center gap-1 text-lg">
                  {['✨', '💕', '✨'].map((e, i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      {e}
                    </motion.span>
                  ))}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEnter}
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
