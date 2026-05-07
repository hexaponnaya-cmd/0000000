import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-[#333] flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0f0f0f] border border-[#1a1a1a]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-[#555] max-w-xs mb-6">{description}</p>}
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
