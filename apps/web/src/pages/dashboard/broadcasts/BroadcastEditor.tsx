import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Eye, EyeOff, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Dropdown } from '@/components/ui/Dropdown'
import { cn } from '@/lib/utils'

const STEPS = ['Audience', 'Details', 'Content', 'Review']

export function BroadcastEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [step, setStep] = useState(0)
  const [broadcastId, setBroadcastId] = useState<string | null>(id && id !== 'new' ? id : null)
  const [audiences, setAudiences] = useState<any[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [name, setName] = useState('')
  const [audienceId, setAudienceId] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlBody, setHtmlBody] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [broadcast, setBroadcast] = useState<any>(null)

  useEffect(() => {
    api.listAudiences().then((res: any) => {
      setAudiences(res.data || res || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isNew && id) {
      api.getBroadcast(id).then((res: any) => {
        const b = res.broadcast || res
        setBroadcast(b)
        setName(b.name || '')
        setAudienceId(b.audience_id || '')
        setFromEmail(b.from_email || '')
        setFromName(b.from_name || '')
        setSubject(b.subject || '')
        setHtmlBody(b.html_body || '')
        setLoading(false)
      }).catch(e => { toast.error(e.message); setLoading(false) })
    }
  }, [id, isNew])

  const saveDraft = useCallback(async (data?: any) => {
    const payload = {
      name: data?.name ?? name,
      audience_id: data?.audienceId ?? audienceId,
      from_email: data?.fromEmail ?? fromEmail,
      from_name: data?.fromName ?? fromName,
      subject: data?.subject ?? subject,
      html_body: data?.htmlBody ?? htmlBody,
    }
    try {
      if (broadcastId) {
        await api.updateBroadcast(broadcastId, payload)
      } else {
        const res: any = await api.createBroadcast({ ...payload, status: 'draft' })
        const b = res.broadcast || res
        setBroadcastId(b.id)
      }
    } catch (e: any) {
      // silent auto-save errors
    }
  }, [broadcastId, name, audienceId, fromEmail, fromName, subject, htmlBody])

  const validateStep = () => {
    const e: Record<string, string> = {}
    if (step === 0) {
      if (!name.trim()) e.name = 'Broadcast name is required'
      if (!audienceId) e.audienceId = 'Please select an audience'
    } else if (step === 1) {
      if (!fromEmail.trim()) e.fromEmail = 'From email is required'
      if (!subject.trim()) e.subject = 'Subject is required'
    } else if (step === 2) {
      if (!htmlBody.trim()) e.htmlBody = 'Email content is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = async () => {
    if (!validateStep()) return
    setSaving(true)
    await saveDraft()
    setSaving(false)
    setStep(s => s + 1)
  }

  const handleSend = async () => {
    if (!broadcastId) { toast.error('Please save the broadcast first'); return }
    setSending(true)
    try {
      await api.sendBroadcast(broadcastId)
      toast.success('Broadcast is sending!')
      navigate('/dashboard/broadcasts')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSending(false)
    }
  }

  const audienceOptions = audiences.map(a => ({
    value: a.id,
    label: `${a.name} (${(a.contact_count || a.contacts_count || 0).toLocaleString()} contacts)`,
  }))

  if (loading) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Broadcasts
      </button>

      <h1 className="text-xl font-semibold text-white mb-8">
        {isNew ? 'New Broadcast' : name || 'Edit Broadcast'}
      </h1>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors',
                i === step ? 'text-white' : i < step ? 'text-primary cursor-pointer hover:text-primary/80' : 'text-[#555]'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border',
                i === step ? 'bg-primary border-primary text-white' :
                i < step ? 'bg-primary/20 border-primary/40 text-primary' :
                'bg-transparent border-[#2a2a2a] text-[#555]'
              )}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              {s}
            </button>
            {i < STEPS.length - 1 && (
              <div className={cn('w-8 h-px mx-2', i < step ? 'bg-primary/40' : 'bg-[#2a2a2a]')} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 mb-6">
        {step === 0 && (
          <div className="space-y-4 max-w-md">
            <Input
              label="Broadcast name"
              placeholder="e.g. October Newsletter"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(er => ({ ...er, name: '' })) }}
              error={errors.name}
              autoFocus
            />
            <div>
              <label className="block text-sm font-medium text-[#ccc] mb-1.5">Audience</label>
              <Dropdown
                items={audienceOptions}
                value={audienceId}
                onChange={v => { setAudienceId(v); setErrors(er => ({ ...er, audienceId: '' })) }}
                placeholder="Select an audience..."
              />
              {errors.audienceId && <p className="mt-1 text-xs text-red-400">{errors.audienceId}</p>}
              {audiences.length === 0 && (
                <p className="mt-1 text-xs text-[#555]">
                  No audiences yet.{' '}
                  <button onClick={() => navigate('/dashboard/audiences')} className="text-primary hover:underline">
                    Create one first
                  </button>
                </p>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 max-w-md">
            <Input
              label="From email"
              type="email"
              placeholder="newsletter@yourdomain.com"
              value={fromEmail}
              onChange={e => { setFromEmail(e.target.value); setErrors(er => ({ ...er, fromEmail: '' })) }}
              error={errors.fromEmail}
              autoFocus
            />
            <Input
              label="From name (optional)"
              placeholder="Your Company"
              value={fromName}
              onChange={e => setFromName(e.target.value)}
            />
            <Input
              label="Subject line"
              placeholder="Your email subject..."
              value={subject}
              onChange={e => { setSubject(e.target.value); setErrors(er => ({ ...er, subject: '' })) }}
              error={errors.subject}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[#ccc]">HTML Email Body</label>
              <Button
                variant="ghost" size="sm"
                onClick={() => setPreviewMode(p => !p)}
              >
                {previewMode ? <><EyeOff className="w-3.5 h-3.5" /> Edit</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </Button>
            </div>
            {previewMode ? (
              <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
                <iframe
                  srcDoc={htmlBody}
                  className="w-full h-[500px] border-0 bg-white"
                  sandbox="allow-same-origin"
                  title="Email Preview"
                />
              </div>
            ) : (
              <Textarea
                placeholder="<html><body><h1>Hello!</h1></body></html>"
                value={htmlBody}
                onChange={e => { setHtmlBody(e.target.value); setErrors(er => ({ ...er, htmlBody: '' })) }}
                error={errors.htmlBody}
                className="font-mono text-xs min-h-[400px]"
                autoFocus
              />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Review your broadcast</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Name', value: name },
                { label: 'Audience', value: audiences.find(a => a.id === audienceId)?.name || audienceId },
                { label: 'From', value: fromName ? `${fromName} <${fromEmail}>` : fromEmail },
                { label: 'Subject', value: subject },
              ].map(f => (
                <div key={f.label} className="bg-[#111] border border-[#2a2a2a] rounded-lg p-3">
                  <div className="text-xs text-[#555] mb-1">{f.label}</div>
                  <div className="text-white">{f.value}</div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-900/20 border border-yellow-900/50 rounded-lg p-3 text-sm text-yellow-400">
              ⚠️ Once sent, this broadcast cannot be cancelled. Please review carefully.
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </Button>
        <div className="flex items-center gap-2">
          {step < 3 ? (
            <Button size="sm" onClick={handleNext} loading={saving}>
              Continue →
            </Button>
          ) : (
            <Button size="sm" onClick={handleSend} loading={sending}>
              <Send className="w-4 h-4" /> Send Now
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
