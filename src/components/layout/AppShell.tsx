import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '../ui/Toast'

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        <span className="text-3xl select-none">💗</span>
      </motion.div>
      <motion.p className="text-sm text-[#A090A3]" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
        甜蜜加载中...
      </motion.p>
    </div>
  )
}

export function AppShell() {
  const location = useLocation()

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: '#FFF0F4' }}>
      <ToastContainer />

      {/* Header — fixed top */}
      <div className="flex-shrink-0 z-30">
        <Header />
      </div>

      {/* Content — fills remaining space */}
      <div className="flex-1 min-h-0 relative z-[1]">
        <Suspense fallback={<LoadingFallback />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-0"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      {/* Bottom Nav — fixed bottom */}
      <div className="flex-shrink-0 z-30">
        <BottomNav />
      </div>
    </div>
  )
}
