import { cn } from '@/lib/utils'

const statusStyles: Record<string, string> = {
  queued: 'bg-gray-800 text-gray-300 border border-gray-700',
  sent: 'bg-blue-900/40 text-blue-400 border border-blue-900/60',
  delivered: 'bg-green-900/40 text-green-400 border border-green-900/60',
  bounced: 'bg-red-900/40 text-red-400 border border-red-900/60',
  opened: 'bg-purple-900/40 text-purple-400 border border-purple-900/60',
  clicked: 'bg-indigo-900/40 text-indigo-400 border border-indigo-900/60',
  failed: 'bg-red-900/40 text-red-400 border border-red-900/60',
  cancelled: 'bg-gray-800 text-gray-500 border border-gray-700',
  pending: 'bg-yellow-900/40 text-yellow-400 border border-yellow-900/60',
  verified: 'bg-green-900/40 text-green-400 border border-green-900/60',
  draft: 'bg-gray-800 text-gray-400 border border-gray-700',
  sending: 'bg-blue-900/40 text-blue-400 border border-blue-900/60',
  scheduled: 'bg-yellow-900/40 text-yellow-400 border border-yellow-900/60',
  success: 'bg-green-900/40 text-green-400 border border-green-900/60',
  error: 'bg-red-900/40 text-red-400 border border-red-900/60',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || 'bg-gray-800 text-gray-400 border border-gray-700'
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize',
      style,
      className
    )}>
      {status}
    </span>
  )
}
