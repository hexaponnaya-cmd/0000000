import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none'
    const variants = {
      primary: 'bg-primary hover:bg-primary-hover text-white',
      secondary: 'bg-[#1a1a1a] hover:bg-[#222] text-white border border-[#2a2a2a]',
      ghost: 'hover:bg-[#161616] text-[#888] hover:text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      outline: 'border border-[#2a2a2a] hover:border-[#3a3a3a] text-white hover:bg-[#161616]',
    }
    const sizes = {
      sm: 'px-3 py-1.5 text-xs h-7',
      md: 'px-4 py-2 text-sm h-9',
      lg: 'px-6 py-2.5 text-base h-11',
    }
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
