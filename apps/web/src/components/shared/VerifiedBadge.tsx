import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
  tooltip?: string
}

export function VerifiedBadge({ size = 'md', className, showLabel = false, tooltip }: VerifiedBadgeProps) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      title={tooltip || 'Meta Verified Sender — This sender has been authenticated with SPF, DKIM, and DMARC'}
    >
      <span className="relative inline-flex">
        <ShieldCheck className={cn(sizes[size], 'text-[#6366f1] drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]')} />
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-[#6366f1]">Verified</span>
      )}
    </span>
  )
}
