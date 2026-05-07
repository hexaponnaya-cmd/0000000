import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'purple' | 'blue'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-[#1a1a1a] text-[#888] border border-[#2a2a2a]',
    success: 'bg-green-900/30 text-green-400 border border-green-900/50',
    error: 'bg-red-900/30 text-red-400 border border-red-900/50',
    warning: 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50',
    info: 'bg-blue-900/30 text-blue-400 border border-blue-900/50',
    purple: 'bg-purple-900/30 text-purple-400 border border-purple-900/50',
    blue: 'bg-indigo-900/30 text-indigo-400 border border-indigo-900/50',
  }
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
