import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { DataTable } from '@/components/shared/DataTable'
import { CopyButton } from '@/components/shared/CopyButton'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatUnix } from '@/lib/utils'

export function ApiKeys() {
  const [keys, setKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState('full')
  const [nameError, setNameError] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchKeys = async () => {
    setLoading(true)
    try {
      const res: any = await api.listApiKeys()
      setKeys(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchKeys() }, [])

  const handleCreate = async () => {
    if (!name.trim()) { setNameError('Name is required'); return }
    setCreating(true)
    try {
      const res: any = await api.createApiKey(name.trim(), permissions)
      const key = res.api_key || res
      setNewKey(key.key || key.full_key)
      await fetchKeys()
      setName('')
      setPermissions('full')
      setCreateOpen(false)
    } catch (e: any) {
      setNameError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteApiKey(deleteId)
      setKeys(prev => prev.filter(k => k.id !== deleteId))
      toast.success('API key deleted')
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
      key: 'key_prefix',
      header: 'Key',
      render: (row: any) => (
        <code className="text-xs text-[#888] font-mono bg-[#111] px-2 py-0.5 rounded border border-[#1a1a1a]">
          {row.key_prefix}••••••••••••••••
        </code>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (row: any) => (
        <Badge variant={row.permissions === 'full' ? 'blue' : 'default'}>
          {row.permissions === 'full' ? 'Full access' : 'Sending only'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row: any) => <span className="text-xs text-[#555]">{formatUnix(row.created_at)}</span>,
    },
    {
      key: 'last_used_at',
      header: 'Last used',
      render: (row: any) => (
        <span className="text-xs text-[#555]">
          {row.last_used_at ? formatUnix(row.last_used_at) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
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
          <h1 className="text-xl font-semibold text-white">API Keys</h1>
          <p className="text-sm text-[#555] mt-0.5">Manage access to the LEGSEND API</p>
        </div>
        <Button size="sm" onClick={() => { setCreateOpen(true); setName(''); setPermissions('full'); setNameError('') }}>
          <Plus className="w-4 h-4" /> Create API Key
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={keys}
        loading={loading}
        emptyState={
          <EmptyState
            icon={<Key className="w-6 h-6" />}
            title="No API keys"
            description="Create an API key to start sending emails programmatically."
            action={{ label: 'Create API Key', onClick: () => setCreateOpen(true) }}
          />
        }
      />

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create API Key" size="sm">
        <div className="space-y-5">
          <Input
            label="Key name"
            placeholder="e.g. Production, Development"
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            error={nameError}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-[#ccc] mb-2">Permissions</label>
            <div className="space-y-2">
              {[
                { value: 'full', label: 'Full access', desc: 'Can send emails, manage domains, API keys, and more' },
                { value: 'sending_access', label: 'Sending access only', desc: 'Can only send emails via POST /v1/emails' },
              ].map(opt => (
                <label key={opt.value} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${permissions === opt.value ? 'border-primary bg-primary/5' : 'border-[#2a2a2a] hover:border-[#3a3a3a]'}`}>
                  <input
                    type="radio"
                    value={opt.value}
                    checked={permissions === opt.value}
                    onChange={() => setPermissions(opt.value)}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <div className="text-sm text-white font-medium">{opt.label}</div>
                    <div className="text-xs text-[#555]">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} loading={creating}>Create Key</Button>
          </div>
        </div>
      </Modal>

      {/* New Key Display Modal */}
      <Modal open={!!newKey} onClose={() => setNewKey(null)} title="API Key Created" size="md">
        <div className="space-y-4">
          <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3 text-sm text-yellow-400">
            ⚠️ Save this key now — you won't be able to see it again.
          </div>
          <div>
            <label className="block text-xs text-[#555] mb-2 uppercase tracking-wider">Your API Key</label>
            <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-3">
              <code className="flex-1 text-sm text-green-300 font-mono break-all select-all">{newKey}</code>
              <CopyButton text={newKey || ''} size="md" showText />
            </div>
          </div>
          <Button className="w-full" onClick={() => setNewKey(null)}>I've saved my key</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete API Key"
        message="This key will be permanently deleted and any integrations using it will stop working immediately."
        confirmLabel="Delete Key"
        loading={deleting}
      />
    </div>
  )
}
