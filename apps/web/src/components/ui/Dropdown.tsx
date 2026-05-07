import { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  danger?: boolean
}

interface DropdownProps {
  items: DropdownItem[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  triggerClassName?: string
}

export function Dropdown({ items, value, onChange, placeholder = 'Select...', className, triggerClassName }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = items.find(i => i.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm',
          'text-white hover:border-[#3a3a3a] transition-colors focus:outline-none focus:border-primary',
          triggerClassName
        )}
      >
        {selected?.icon && <span className="text-[#888]">{selected.icon}</span>}
        <span className="flex-1 text-left">{selected ? selected.label : <span className="text-[#555]">{placeholder}</span>}</span>
        <ChevronDown className={cn('w-4 h-4 text-[#555] transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111] border border-[#2a2a2a] rounded-lg shadow-xl z-50 py-1 overflow-hidden">
          {items.map(item => (
            <button
              key={item.value}
              type="button"
              onClick={() => { onChange?.(item.value); setOpen(false) }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors',
                item.danger ? 'text-red-400 hover:bg-red-900/20' : 'text-[#ccc] hover:bg-[#1a1a1a] hover:text-white',
                value === item.value && 'bg-[#1a1a1a] text-white'
              )}
            >
              {item.icon && <span>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
