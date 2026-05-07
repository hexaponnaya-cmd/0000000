import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  onMenuClick?: () => void
  className?: string
}

export function Header({ title, subtitle, actions, onMenuClick, className }: HeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-8', className)}>
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[#555] hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          {title && <h1 className="text-xl font-semibold text-white">{title}</h1>}
          {subtitle && <p className="text-sm text-[#555] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
