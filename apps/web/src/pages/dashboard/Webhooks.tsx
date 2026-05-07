import { useState, useEffect } from 'react'
import { Webhook, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { CopyButton } from '@/components/shared/CopyButton'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatUnix, isValidUrl } from '@/lib/utils'

const ALL_EVENTS = [
  'email.sent', 'email.delivered', 'email.bounced',
  'email.opened', 'email.clicked', 'email.complained',
]

export function Webhooks() {
  const [webhooks, setWebhooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([...ALL_EVENTS])
  const [urlError, setUrlError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<Record<string, any[]>>({})
  const [loadingDeliveries, setLoadingDeliveries] = useState<string | null>(null)

  const fetchWebhooks = async () => {
    setLoading(true)
    try {
      const res: any = await api.listWebhooks()
      setWebhooks(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWebhooks() }, [])

  const toggleEvent = (ev: string) => {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    )
  }

  const handleCreate = async () => {
    if (!url.trim()) { setUrlError('URL is required'); return }
    if (!isValidUrl(url.trim())) { setUrlError('Invalid URL format'); return }
    if (selectedEvents.length === 0) { toast.error('Select at least one event'); return }
    setCreating(true)
    try {
      const res: any = await api.createWebhook({ url: url.trim(), events: selectedEvents })
      const wh = res.webhook || res
      setNewSecret(wh.secret || null)
      await fetchWebhooks()
      setCreateOpen(false)
      setUrl('')
      setSelectedEvents([...ALL_EVENTS])
    } catch (e: any) {
      setUrlError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteWebhook(deleteId)
      setWebhooks(prev => prev.filter(w => w.id !== deleteId))
      toast.success('Webhook deleted')
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleEnabled = async (wh: any) => {
    try {
      const res: any = await api.updateWebhook(wh.id, { enabled: !wh.enabled })
      setWebhooks(prev => prev.map(w => w.id === wh.id ? { ...w, enabled: !wh.enabled } : w))
      toast.success(wh.enabled ? 'Webhook disabled' : 'Webhook enabled')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const loadDeliveries = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (deliveries[id]) return
    setLoadingDeliveries(id)
    try {
      const res: any = await api.getWebhookDeliveries(id)
      setDeliveries(prev => ({ ...prev, [id]: res.data || res || [] }))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoadingDeliveries(null)
    }
  }

  const columns = [
    {
      key: 'url',
      header: 'Endpoint',
      render: (row: any) => (
        <div className="max-w-xs">
          <span className="text-white text-xs font-mono truncate block">{row.url}</span>
        </div>
      ),
    },
    {
      key: 'events',
      header: 'Events',
      render: (row: any) => {
        const evts = typeof row.events === 'string' ? JSON.parse(row.events || '[]') : (row.events || [])
        return (
          <div className="flex flex-wrap gap-1">
            {evts.slice(0, 3).map((ev: string) => (
              <Badge key={ev} variant="default" className="text-xs">{ev}</Badge>
            ))}
            {evts.length > 3 && <Badge variant="default">+{evts.length - 3}</Badge>}
          </div>
        )
      },
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (row: any) => (
        <button onClick={e => { e.stopPropagation(); toggleEnabled(row) }} className="flex items-center">
          <div className={`w-8 h-4 rounded-full transition-colors ${row.enabled ? 'bg-green-600' : 'bg-[#2a2a2a]'} relative`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${row.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: any) => <span className="text-xs text-[#555]">{formatUnix(row.created_at)}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => loadDeliveries(row.id)} title="View deliveries">
            {expandedId === row.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={() => setDeleteId(row.id)}>
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
          <h1 className="text-xl font-semibold text-white">Webhooks</h1>
          <p className="text-sm text-[#555] mt-0.5">Receive real-time notifications for email events</p>
        </div>
        <Button size="sm" onClick={() => { setCreateOpen(true); setUrl(''); setUrlError(''); setSelectedEvents([...ALL_EVENTS]) }}>
          <Plus className="w-4 h-4" /> Add Webhook
        </Button>
      </div>

      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
              <tr>
                {columns.map(col => (
                  <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#555] uppercase tracking-wider">{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#0a0a0a]">
                    {columns.map(c => (
                      <td key={c.key} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : webhooks.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState
                      icon={<Webhook className="w-6 h-6" />}
                      title="No webhooks configured"
                      description="Receive real-time HTTP notifications when email events occur."
                      action={{ label: 'Add Webhook', onClick: () => setCreateOpen(true) }}
                    />
                  </td>
                </tr>
              ) : (
                webhooks.map(wh => (
                  <>
                    <tr key={wh.id} className="border-b border-[#0a0a0a] hover:bg-[#0d0d0d]">
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3 text-[#ccc]">{col.render(wh)}</td>
                      ))}
                    </tr>
                    {expandedId === wh.id && (
                      <tr key={`${wh.id}-deliveries`} className="border-b border-[#0a0a0a] bg-[#080808]">
                        <td colSpan={columns.length} className="px-4 py-4">
                          <div className="text-xs font-medium text-[#555] uppercase tracking-wider mb-3">Recent Deliveries</div>
                          {loadingDeliveries === wh.id ? (
                            <div className="skeleton h-16 rounded" />
                          ) : (deliveries[wh.id] || []).length === 0 ? (
                            <p className="text-sm text-[#555]">No deliveries yet</p>
                          ) : (
                            <div className="space-y-2">
                              {(deliveries[wh.id] || []).slice(0, 5).map((d: any) => (
                                <div key={d.id} className="flex items-center gap-4 text-xs bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
                                  <StatusBadge status={d.status} />
                                  <span className="text-[#888]">{d.event}</span>
                                  {d.response_code && <span className="text-[#555]">HTTP {d.response_code}</span>}
                                  <span className="text-[#555] ml-auto">{formatUnix(d.created_at)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Webhook" size="md">
        <div className="space-y-5">
          <Input
            label="Endpoint URL"
            type="url"
            placeholder="https://yoursite.com/webhooks/legsend"
            value={url}
            onChange={e => { setUrl(e.target.value); setUrlError('') }}
            error={urlError}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">Events to listen for</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map(ev => (
                <label key={ev} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${selectedEvents.includes(ev) ? 'border-primary/50 bg-primary/5' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(ev)}
                    onChange={() => toggleEvent(ev)}
                    className="accent-primary"
                  />
                  <span className="text-xs text-[#ccc] font-mono">{ev}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} loading={creating}>Add Webhook</Button>
          </div>
        </div>
      </Modal>

      {/* Secret Display */}
      <Modal open={!!newSecret} onClose={() => setNewSecret(null)} title="Webhook Secret" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3">
            ⚠️ Save this secret — it won't be shown again. Use it to verify webhook signatures.
          </p>
          <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
            <code className="flex-1 text-xs text-green-300 font-mono break-all">{newSecret}</code>
            <CopyButton text={newSecret || ''} size="md" showText />
          </div>
          <Button className="w-full" onClick={() => setNewSecret(null)}>I've saved the secret</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Webhook"
        message="This webhook will be permanently deleted and will stop receiving events."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
