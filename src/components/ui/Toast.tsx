import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, Heart } from 'lucide-react'
import { useUIStore } from '../../stores/uiStore'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  love: Heart,
}

const colors = {
  success: 'border-green-400 bg-green-50',
  error: 'border-red-400 bg-red-50',
  info: 'border-blue-400 bg-blue-50',
  love: 'border-pink-400 bg-pink-50',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg ${colors[toast.type]}`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-sm font-medium text-text">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-2 p-1 rounded-full hover:bg-black/10 cursor-pointer">
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
