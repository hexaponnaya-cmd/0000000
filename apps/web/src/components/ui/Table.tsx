import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface TableProps {
  children: ReactNode
  className?: string
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
}

export function TableHead({ children, className }: TableProps) {
  return (
    <thead className={cn('border-b border-[#1a1a1a]', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className, onClick }: TableProps & { onClick?: () => void }) {
  return (
    <tr
      className={cn(
        'border-b border-[#0f0f0f] transition-colors',
        onClick && 'cursor-pointer hover:bg-[#0d0d0d]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider whitespace-nowrap', className)}>
      {children}
    </th>
  )
}

export function TableCell({ children, className }: TableProps) {
  return (
    <td className={cn('px-4 py-3 text-[#ccc] whitespace-nowrap', className)}>
      {children}
    </td>
  )
}
