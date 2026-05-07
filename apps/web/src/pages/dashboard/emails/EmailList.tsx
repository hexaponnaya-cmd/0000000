import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Search, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { DataTable } from '@/components/shared/DataTable'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { formatUnix, truncate } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'queued', label: 'Queued' },
  { value: 'sent', label: 'Sent' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'bounced', label: 'Bounced' },
  { value: 'failed', label: 'Failed' },
  { value: 'scheduled', label: 'Scheduled' },
]

export function EmailList() {
  const navigate = useNavigate()
  const [emails, setEmails] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchEmails = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' }
      if (status) params.status = status
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      const res: any = await api.listEmails(params)
      const data = res.data || res || []
      setEmails(data)
      setTotal(res.total || data.length)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [page, status, dateFrom, dateTo])

  useEffect(() => { fetchEmails() }, [fetchEmails])

  const filtered = search
    ? emails.filter(e =>
        e.subject?.toLowerCase().includes(search.toLowerCase()) ||
        e.from_address?.toLowerCase().includes(search.toLowerCase()) ||
        (typeof e.to_addresses === 'string' ? e.to_addresses : JSON.stringify(e.to_addresses || '')).toLowerCase().includes(search.toLowerCase())
      )
    : emails

  const columns = [
    {
      key: 'from_address',
      header: 'From',
      render: (row: any) => <span className="text-white font-mono text-xs">{row.from_address}</span>,
    },
    {
      key: 'to_addresses',
      header: 'To',
      render: (row: any) => {
        const to = Array.isArray(row.to_addresses) ? row.to_addresses[0] : row.to_addresses
        return <span className="font-mono text-xs text-[#888]">{truncate(to || '', 28)}</span>
      },
    },
    {
      key: 'subject',
      header: 'Subject',
      render: (row: any) => <span className="text-sm">{truncate(row.subject || '', 40)}</span>,
      className: 'max-w-xs',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: any) => <span className="text-xs text-[#555]">{formatUnix(row.created_at, 'MMM d, HH:mm')}</span>,
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Emails</h1>
          <p className="text-sm text-[#555] mt-0.5">{total.toLocaleString()} emails total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search subject, from, to..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Dropdown
          items={STATUS_OPTIONS}
          value={status}
          onChange={v => { setStatus(v); setPage(1) }}
          placeholder="All statuses"
          className="w-40"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          className="w-36"
          title="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={e => { setDateTo(e.target.value); setPage(1) }}
          className="w-36"
          title="To date"
        />
        {(status || dateFrom || dateTo || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setDateFrom(''); setDateTo(''); setSearch(''); setPage(1) }}>
            Clear
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        onRowClick={row => navigate(`/dashboard/emails/${row.id}`)}
        page={page}
        perPage={20}
        total={total}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<Mail className="w-6 h-6" />}
            title="No emails yet"
            description="Emails you send via the API will appear here."
          />
        }
      />
    </div>
  )
}
