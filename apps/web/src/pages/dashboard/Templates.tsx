import { useState, useEffect } from 'react'
import { FileText, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { EmptyState } from '@/components/shared/EmptyState'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { formatUnix } from '@/lib/utils'

export function Templates() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [alias, setAlias] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res: any = await api.listTemplates()
      setTemplates(res.data || res || [])
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTemplates() }, [])

  const openCreate = () => {
    setEditingId(null)
    setName(''); setSubject(''); setHtmlBody(''); setAlias(''); setErrors({})
    setPreviewMode(false)
    setModalOpen(true)
  }

  const openEdit = (t: any) => {
    setEditingId(t.id)
    setName(t.name || ''); setSubject(t.subject || ''); setHtmlBody(t.html_body || ''); setAlias(t.alias || '')
    setErrors({})
    setPreviewMode(false)
    setModalOpen(true)
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!subject.trim()) e.subject = 'Subject is required'
    if (!htmlBody.trim()) e.htmlBody = 'HTML body is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      const payload = { name: name.trim(), subject: subject.trim(), html_body: htmlBody, alias: alias.trim() || undefined }
      if (editingId) {
        const res: any = await api.updateTemplate(editingId, payload)
        const t = res.template || res
        setTemplates(prev => prev.map(x => x.id === editingId ? t : x))
        toast.success('Template updated')
      } else {
        const res: any = await api.createTemplate(payload)
        const t = res.template || res
        setTemplates(prev => [t, ...prev])
        toast.success('Template created')
      }
      setModalOpen(false)
    } catch (e: any) {
      setErrors({ name: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await api.deleteTemplate(deleteId)
      setTemplates(prev => prev.filter(t => t.id !== deleteId))
      toast.success('Template deleted')
      setDeleteId(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">Templates</h1>
          <p className="text-sm text-[#555] mt-0.5">Reusable email templates</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)}
        </div>
      ) : templates.length === 0 ? (
        <div className="border border-[#1a1a1a] rounded-xl">
          <EmptyState
            icon={<FileText className="w-6 h-6" />}
            title="No templates yet"
            description="Create reusable email templates to speed up your workflow."
            action={{ label: 'Create Template', onClick: openCreate }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => (
            <div key={t.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#2a2a2a] transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/10" onClick={() => setDeleteId(t.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{t.name}</h3>
              <p className="text-xs text-[#555] truncate mb-3">{t.subject}</p>
              {t.alias && (
                <code className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{t.alias}</code>
              )}
              <div className="mt-3 text-xs text-[#444]">
                {formatUnix(t.updated_at || t.created_at)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Template' : 'Create Template'}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template name"
              placeholder="Welcome Email"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }}
              error={errors.name}
              autoFocus
            />
            <Input
              label="Alias (optional)"
              placeholder="welcome-email"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              hint="Used to reference this template in the API"
            />
          </div>
          <Input
            label="Subject line"
            placeholder="Welcome to {{company}}!"
            value={subject}
            onChange={e => { setSubject(e.target.value); setErrors(er => ({ ...er, subject: '' })) }}
            error={errors.subject}
          />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[#ccc]">HTML Body</label>
              <Button variant="ghost" size="sm" onClick={() => setPreviewMode(p => !p)}>
                {previewMode ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </Button>
            </div>
            {previewMode ? (
              <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                <iframe srcDoc={htmlBody} className="w-full h-64 border-0 bg-white" sandbox="allow-same-origin" title="Preview" />
              </div>
            ) : (
              <Textarea
                placeholder="<html>...</html>"
                value={htmlBody}
                onChange={e => { setHtmlBody(e.target.value); setErrors(er => ({ ...er, htmlBody: '' })) }}
                error={errors.htmlBody}
                className="font-mono text-xs min-h-[200px]"
              />
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} loading={saving}>{editingId ? 'Save Changes' : 'Create Template'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message="This template will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  )
}
