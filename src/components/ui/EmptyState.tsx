import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4 animate-float">{icon}</div>
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </Button>
      )}
    </div>
  )
}
