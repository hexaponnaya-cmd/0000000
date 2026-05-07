import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  iconColor?: string
  change?: string
  changePositive?: boolean
  className?: string
  loading?: boolean
}

export function StatsCard({ label, value, icon, iconColor = 'text-primary', change, changePositive, className, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className={cn('bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5', className)}>
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-20" />
      </div>
    )
  }
  return (
    <div className={cn('bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#555] uppercase tracking-wider font-medium">{label}</span>
        {icon && <div className={cn('text-lg', iconColor)}>{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-white tabular-nums">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {change && (
        <div className={cn('mt-1 text-xs', changePositive ? 'text-green-400' : 'text-red-400')}>
          {change}
        </div>
      )}
    </div>
  )
}
