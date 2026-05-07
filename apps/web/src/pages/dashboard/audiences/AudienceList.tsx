import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatUnix } from '@/lib/utils'

export function AudienceList() {
  const navigate = useNavigate()
  const [audiences, setAudiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAudiences = async () => {
    setLoading(true)
    try {
      const res: any = await api.listAudiences()
      setAudiences(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAudiences() }, [])

  const handleCreate = async () => {
    if (!name.trim()) { setNameError('Name is required'); return }
    setCreating(true)
    try {
      const res: any = await api.createAudience(name.trim())
      const aud = res.audience || res
      setAudiences(prev => [aud, ...prev])
      toast.success('Audience created')
      setCreateOpen(false)
      setName('')
      navigate(`/dashboard/audiences/${aud.id}`)
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
      await api.deleteAudience(deleteId)
      setAudiences(prev => prev.filter(a => a.id !== deleteId))
      toast.success('Audience deleted')
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
      header: 'Audience',
      render: (row: any) => (
        <span className="text-white font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-[#555]" />
          {row.name}
        </span>
      ),
    },
    {
      key: 'contact_count',
      header: 'Contacts',
      render: (row: any) => (
        <span className="text-sm text-[#888]">
          {(row.contact_count ?? row.contacts_count ?? 0).toLocaleString()}
        </span>
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
        <div className="flex justify-end" onClick={e => e.stopPropagation()}>
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
          <h1 className="text-xl font-semibold text-white">Audiences</h1>
          <p className="text-sm text-[#555] mt-0.5">Manage your contact lists</p>
        </div>
        <Button size="sm" onClick={() => { setCreateOpen(true); setName(''); setNameError('') }}>
          <Plus className="w-4 h-4" /> Create Audience
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={audiences}
        loading={loading}
        onRowClick={row => navigate(`/dashboard/audiences/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No audiences yet"
            description="Create an audience to manage your contact lists and send broadcasts."
            action={{ label: 'Create Audience', onClick: () => setCreateOpen(true) }}
          />
        }
      />

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Audience" size="sm">
        <div className="space-y-4">
          <Input
            label="Audience name"
            placeholder="e.g. Newsletter subscribers"
            value={name}
            onChange={e => { setName(e.target.value); setNameError('') }}
            error={nameError}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} loading={creating}>Create</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Audience"
        message="This will permanently delete the audience and all its contacts. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
