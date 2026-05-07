import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Megaphone, Plus, Trash2, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { Button } from '@/components/ui/Button'
import { formatUnix } from '@/lib/utils'

export function BroadcastList() {
  const navigate = useNavigate()
  const [broadcasts, setBroadcasts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchBroadcasts = async () => {
    setLoading(true)
    try {
      const res: any = await api.listBroadcasts()
      setBroadcasts(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBroadcasts() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteBroadcast(deleteId)
      setBroadcasts(prev => prev.filter(b => b.id !== deleteId))
      toast.success('Broadcast deleted')
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: any) => <span className="text-white font-medium">{row.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      key: 'audience',
      header: 'Audience',
      render: (row: any) => <span className="text-sm text-[#888]">{row.audience_name || row.audience_id || '—'}</span>,
    },
    {
      key: 'total_recipients',
      header: 'Recipients',
      render: (row: any) => <span className="text-sm">{(row.total_recipients || 0).toLocaleString()}</span>,
    },
    {
      key: 'stats',
      header: 'Open Rate',
      render: (row: any) => {
        const rate = row.total_recipients > 0
          ? Math.round((row.opened_count || 0) / row.total_recipients * 100)
          : 0
        return <span className="text-sm text-[#888]">{row.status === 'sent' ? `${rate}%` : '—'}</span>
      },
    },
    {
      key: 'sent_at',
      header: 'Date',
      render: (row: any) => (
        <span className="text-xs text-[#555]">
          {row.sent_at ? formatUnix(row.sent_at) : formatUnix(row.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost" size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
            onClick={() => setDeleteId(row.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Broadcasts</h1>
          <p className="text-sm text-[#555] mt-0.5">Send emails to your audiences</p>
        </div>
        <Button size="sm" onClick={() => navigate('/dashboard/broadcasts/new')}>
          <Plus className="w-4 h-4" /> Create Broadcast
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={broadcasts}
        loading={loading}
        onRowClick={row => navigate(`/dashboard/broadcasts/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<Megaphone className="w-6 h-6" />}
            title="No broadcasts yet"
            description="Create a broadcast to send emails to an entire audience."
            action={{ label: 'Create Broadcast', onClick: () => navigate('/dashboard/broadcasts/new') }}
          />
        }
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Broadcast"
        message="This broadcast will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
