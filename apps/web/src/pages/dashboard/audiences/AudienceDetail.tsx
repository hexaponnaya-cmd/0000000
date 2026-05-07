import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Plus, Trash2, Upload } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { DataTable } from '@/components/shared/DataTable'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatUnix, isValidEmail } from '@/lib/utils'

export function AudienceDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [audience, setAudience] = useState<any>(null)
  const [contacts, setContacts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [emailError, setEmailError] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [audRes, contactsRes]: any[] = await Promise.all([
        api.listAudiences().then((r: any) => {
          const list = r.data || r || []
          return list.find((a: any) => a.id === id) || null
        }),
        api.listContacts(id, { page: String(page), per_page: '20' }),
      ])
      setAudience(audRes)
      const c = contactsRes.data || contactsRes || []
      setContacts(c)
      setTotal(contactsRes.total || c.length)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [id, page])

  const handleAddContact = async () => {
    if (!email.trim()) { setEmailError('Email is required'); return }
    if (!isValidEmail(email)) { setEmailError('Invalid email address'); return }
    setAdding(true)
    try {
      await api.addContact(id!, { email: email.trim(), first_name: firstName.trim() || undefined, last_name: lastName.trim() || undefined })
      toast.success('Contact added')
      setAddOpen(false)
      setEmail(''); setFirstName(''); setLastName('')
      fetchData()
    } catch (e: any) {
      setEmailError(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteContact(id!, deleteId)
      setContacts(prev => prev.filter(c => c.id !== deleteId))
      setTotal(t => t - 1)
      toast.success('Contact removed')
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const columns = [
    {
      key: 'email',
      header: 'Email',
      render: (row: any) => <span className="text-white font-mono text-xs">{row.email}</span>,
    },
    {
      key: 'first_name',
      header: 'First Name',
      render: (row: any) => <span className="text-sm text-[#888]">{row.first_name || '—'}</span>,
    },
    {
      key: 'last_name',
      header: 'Last Name',
      render: (row: any) => <span className="text-sm text-[#888]">{row.last_name || '—'}</span>,
    },
    {
      key: 'unsubscribed',
      header: 'Status',
      render: (row: any) => (
        <Badge variant={row.unsubscribed ? 'error' : 'success'}>
          {row.unsubscribed ? 'Unsubscribed' : 'Subscribed'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Added',
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
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Audiences
      </button>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#555]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{audience?.name || 'Audience'}</h1>
            <p className="text-sm text-[#555] mt-0.5">{total.toLocaleString()} contacts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled title="CSV import coming soon">
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => { setAddOpen(true); setEmail(''); setFirstName(''); setLastName(''); setEmailError('') }}>
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={contacts}
        loading={loading}
        page={page}
        perPage={20}
        total={total}
        onPageChange={setPage}
        emptyState={
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No contacts yet"
            description="Add contacts to this audience to send broadcasts."
            action={{ label: 'Add Contact', onClick: () => setAddOpen(true) }}
          />
        }
      />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Contact" size="sm">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="contact@example.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError('') }}
            error={emailError}
            autoFocus
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} />
            <Input label="Last name" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddContact} loading={adding}>Add Contact</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Contact"
        message="Remove this contact from the audience? They will no longer receive broadcasts."
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  )
}
