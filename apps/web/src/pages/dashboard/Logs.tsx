import { useState, useEffect, useCallback } from 'react'
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { formatUnix } from '@/lib/utils'

function MethodBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    GET: 'bg-gray-800 text-gray-300 border border-gray-700',
    POST: 'bg-green-900/40 text-green-400 border border-green-900/60',
    DELETE: 'bg-red-900/40 text-red-400 border border-red-900/60',
    PATCH: 'bg-yellow-900/40 text-yellow-400 border border-yellow-900/60',
    PUT: 'bg-blue-900/40 text-blue-400 border border-blue-900/60',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono ${styles[method] || 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
      {method}
    </span>
  )
}

function StatusCodeBadge({ code }: { code: number }) {
  const variant = code >= 500 ? 'error' : code >= 400 ? 'warning' : 'success'
  return <Badge variant={variant}>{code}</Badge>
}

const STATUS_OPTIONS = [
  { value: '', label: 'All requests' },
  { value: 'success', label: 'Success (2xx)' },
  { value: 'error', label: 'Error (4xx/5xx)' },
]

export function Logs() {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [logDetails, setLogDetails] = useState<Record<string, any>>({})

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' }
      if (status) params.status = status
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res: any = await api.listLogs(params)
      const data = res.data || res || []
      setLogs(data)
      setTotal(res.total || data.length)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, status, dateFrom, dateTo])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const toggleExpand = async (log: any) => {
    if (expandedId === log.id) { setExpandedId(null); return }
    setExpandedId(log.id)
    if (logDetails[log.id]) return
    try {
      const res: any = await api.getLog(log.id)
      setLogDetails(prev => ({ ...prev, [log.id]: res.log || res }))
    } catch {
      setLogDetails(prev => ({ ...prev, [log.id]: log }))
    }
  }

  const columns = [
    {
      key: 'method',
      header: 'Method',
      render: (row: any) => <MethodBadge method={row.method} />,
    },
    {
      key: 'path',
      header: 'Endpoint',
      render: (row: any) => <code className="text-xs text-[#ccc] font-mono">{row.path}</code>,
    },
    {
      key: 'status_code',
      header: 'Status',
      render: (row: any) => <StatusCodeBadge code={row.status_code} />,
    },
    {
      key: 'duration_ms',
      header: 'Duration',
      render: (row: any) => (
        <span className="text-xs text-[#888]">{row.duration_ms != null ? `${row.duration_ms}ms` : '—'}</span>
      ),
    },
    {
      key: 'user_agent',
      header: 'User Agent',
      render: (row: any) => (
        <span className="text-xs text-[#555] truncate max-w-[160px] block">
          {row.user_agent ? row.user_agent.slice(0, 40) : '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Time',
      render: (row: any) => <span className="text-xs text-[#555]">{formatUnix(row.created_at, 'MMM d, HH:mm:ss')}</span>,
    },
    {
      key: 'expand',
      header: '',
      render: (row: any) => (
        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); toggleExpand(row) }}>
          {expandedId === row.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Logs</h1>
          <p className="text-sm text-[#555] mt-0.5">API request history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Dropdown
          items={STATUS_OPTIONS}
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          placeholder="All requests"
          className="w-44"
        />
        <Input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="w-36" title="From date" />
        <Input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="w-36" title="To date" />
        {(status || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); setPage(1) }}>Clear</Button>
        )}
      </div>

      {/* Table with expandable rows */}
      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#0a0a0a]">
                    {columns.map(c => <td key={c.key} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>)}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={<ScrollText className="w-6 h-6" />}
                      title="No logs yet"
                      description="API request logs will appear here once you start making requests."
                    />
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <>
                    <tr key={log.id} className="border-b border-[#0a0a0a] hover:bg-[#0d0d0d]">
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3 text-[#ccc] whitespace-nowrap">{col.render(log)}</td>
                      ))}
                    </tr>
                    {expandedId === log.id && (
                      <tr key={`${log.id}-detail`} className="border-b border-[#0a0a0a] bg-[#080808]">
                        <td colSpan={columns.length} className="px-4 py-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-medium text-[#555] uppercase tracking-wider mb-2">Request Body</div>
                              <pre className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-xs text-[#888] font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                                {logDetails[log.id]?.request_body
                                  ? (() => { try { return JSON.stringify(JSON.parse(logDetails[log.id].request_body), null, 2) } catch { return logDetails[log.id].request_body } })()
                                  : 'No request body'
                                }
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-[#555] uppercase tracking-wider mb-2">Response Body</div>
                              <pre className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3 text-xs text-[#888] font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                                {logDetails[log.id]?.response_body
                                  ? (() => { try { return JSON.stringify(JSON.parse(logDetails[log.id].response_body), null, 2) } catch { return logDetails[log.id].response_body } })()
                                  : 'No response body'
                                }
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && logs.length > 0 && total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            <span className="text-xs text-[#555]">{((page - 1) * 20) + 1}–{Math.min(page * 20, total)} of {total.toLocaleString()}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>←</Button>
              <span className="text-xs text-[#555]">{page}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>→</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
