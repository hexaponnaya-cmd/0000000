import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyState?: ReactNode
  onRowClick?: (row: T) => void
  page?: number
  perPage?: number
  total?: number
  onPageChange?: (page: number) => void
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  columns, data, loading, emptyState, onRowClick,
  page = 1, perPage = 20, total = 0, onPageChange, className
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / perPage)

  if (loading) {
    return (
      <div className={cn('border border-[#1a1a1a] rounded-xl overflow-hidden', className)}>
        <table className="w-full text-sm">
          <thead className="border-b border-[#1a1a1a]">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[#0f0f0f]">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="skeleton h-4 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (!loading && data.length === 0 && emptyState) {
    return (
      <div className={cn('border border-[#1a1a1a] rounded-xl overflow-hidden', className)}>
        {emptyState}
      </div>
    )
  }

  return (
    <div className={cn('border border-[#1a1a1a] rounded-xl overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider whitespace-nowrap', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn('border-b border-[#0a0a0a] transition-colors', onRowClick && 'cursor-pointer hover:bg-[#0d0d0d]')}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-[#ccc] whitespace-nowrap', col.className)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
          <span className="text-xs text-[#555]">
            {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-[#555] px-2">{page} / {totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
