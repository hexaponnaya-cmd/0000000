import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Plus, Trash2, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DataTable } from '@/components/shared/DataTable'
import { formatUnix, isValidDomain } from '@/lib/utils'

export function DomainList() {
  const navigate = useNavigate()
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [domainName, setDomainName] = useState('')
  const [domainError, setDomainError] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const fetchDomains = async () => {
    setLoading(true)
    try {
      const res: any = await api.listDomains()
      setDomains(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDomains() }, [])

  const handleAdd = async () => {
    if (!domainName.trim()) { setDomainError('Domain name is required'); return }
    if (!isValidDomain(domainName.trim())) { setDomainError('Invalid domain format (e.g. example.com)'); return }
    setAdding(true)
    try {
      const res: any = await api.addDomain(domainName.trim())
      const newDomain = res.domain || res
      setDomains(prev => [newDomain, ...prev])
      toast.success('Domain added! Configure DNS records to verify.')
      setAddOpen(false)
      setDomainName('')
      navigate(`/dashboard/domains/${newDomain.id}`)
    } catch (e: any) {
      setDomainError(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteDomain(deleteId)
      setDomains(prev => prev.filter(d => d.id !== deleteId))
      toast.success('Domain deleted')
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      const res: any = await api.verifyDomain(id)
      const result = res.verification || res
      if (result.all_verified || (result.spf && result.dkim && result.dmarc)) {
        toast.success('Domain verified successfully!')
      } else {
        toast.info(`Verification: SPF ${result.spf ? '✓' : '✗'}, DKIM ${result.dkim ? '✓' : '✗'}, DMARC ${result.dmarc ? '✓' : '✗'}`)
      }
      await fetchDomains()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setVerifyingId(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Domain',
      render: (row: any) => (
        <span className="text-white font-medium flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#555]" />
          {row.name}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: any) => <StatusBadge status={row.status} />,
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
        <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleVerify(row.id)}
            loading={verifyingId === row.id}
            title="Verify DNS records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
            onClick={() => setDeleteId(row.id)}
            title="Delete domain"
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
          <h1 className="text-xl font-semibold text-white">Domains</h1>
          <p className="text-sm text-[#555] mt-0.5">Verify your sending domains</p>
        </div>
        <Button size="sm" onClick={() => { setAddOpen(true); setDomainName(''); setDomainError('') }}>
          <Plus className="w-4 h-4" /> Add Domain
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={domains}
        loading={loading}
        onRowClick={row => navigate(`/dashboard/domains/${row.id}`)}
        emptyState={
          <EmptyState
            icon={<Globe className="w-6 h-6" />}
            title="No domains added"
            description="Add a domain to enable custom sending addresses and improve deliverability."
            action={{ label: 'Add Domain', onClick: () => setAddOpen(true) }}
          />
        }
      />

      {/* Add Domain Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Domain" description="Add a domain you own to send emails from." size="sm">
        <div className="space-y-4">
          <Input
            label="Domain name"
            placeholder="example.com"
            value={domainName}
            onChange={e => { setDomainName(e.target.value); setDomainError('') }}
            error={domainError}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} loading={adding}>Add Domain</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Domain"
        message="Are you sure you want to delete this domain? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
