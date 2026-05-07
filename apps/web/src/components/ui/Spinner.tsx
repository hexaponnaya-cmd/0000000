import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-8 w-8 border-[3px]' }
  return (
    <div className={cn(
      'animate-spin rounded-full border-[#2a2a2a] border-t-primary',
      sizes[size], className
    )} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Spinner size="lg" />
    </div>
  )
}
