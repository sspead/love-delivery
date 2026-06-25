import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  icon?: ReactNode
  type?: 'button' | 'submit'
  loading?: boolean
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  icon,
  type = 'button',
  loading = false,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40',
    secondary: 'bg-secondary/30 text-text hover:bg-secondary/50',
    ghost: 'bg-transparent text-text hover:bg-white/50',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10',
  }

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="text-lg">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
