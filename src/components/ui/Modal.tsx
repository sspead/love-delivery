import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full sm:max-w-md max-h-[85dvh] overflow-y-auto glass-strong rounded-t-3xl sm:rounded-3xl p-6 safe-bottom"
          >
            {title && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text">{title}</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer">
                  <X size={20} className="text-text-muted" />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
