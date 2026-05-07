import { useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Modal({ open, onClose, title, description, children, size = 'md', className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={cn(
        'relative w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl animate-fade-in',
        sizes[size],
        className
      )}>
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && <h2 className="text-base font-semibold text-white">{title}</h2>}
              {description && <p className="text-sm text-[#888] mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#555] hover:text-white transition-colors ml-4 mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {!title && !description && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#555] hover:text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
