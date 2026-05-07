import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Clock, CheckCircle, XCircle, Eye, MousePointer } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CopyButton } from '@/components/shared/CopyButton'
import { Button } from '@/components/ui/Button'
import { formatUnix, truncate } from '@/lib/utils'

const TABS = ['Preview', 'Plain Text', 'Headers', 'Timeline']

export function EmailDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [email, setEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Preview')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    api.getEmail(id).then((e: any) => {
      setEmail(e.email || e)
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!id) return
    setCancelling(true)
    try {
      await api.cancelEmail(id)
      toast.success('Email cancelled')
      setEmail((e: any) => ({ ...e, status: 'cancelled' }))
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="space-y-4">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!email) return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="text-center py-16 text-[#555]">Email not found</div>
    </div>
  )

  const events = [
    email.created_at && { label: 'Created', ts: email.created_at, icon: <Mail className="w-3.5 h-3.5" />, color: 'text-[#555]' },
    email.sent_at && { label: 'Sent', ts: email.sent_at, icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-blue-400' },
    email.delivered_at && { label: 'Delivered', ts: email.delivered_at, icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-400' },
    email.opened_at && { label: 'Opened', ts: email.opened_at, icon: <Eye className="w-3.5 h-3.5" />, color: 'text-purple-400' },
    email.clicked_at && { label: 'Clicked', ts: email.clicked_at, icon: <MousePointer className="w-3.5 h-3.5" />, color: 'text-indigo-400' },
    email.bounced_at && { label: 'Bounced', ts: email.bounced_at, icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-400' },
  ].filter(Boolean)

  const toList = Array.isArray(email.to_addresses) ? email.to_addresses.join(', ') : email.to_addresses

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Emails
        </button>
        {email.status === 'scheduled' && (
          <Button variant="danger" size="sm" onClick={handleCancel} loading={cancelling}>
            Cancel Send
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white flex-1 truncate">{email.subject}</h1>
        <StatusBadge status={email.status} />
      </div>

      {/* Metadata */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: 'Email ID', value: email.id, copy: true },
            { label: 'Status', value: <StatusBadge status={email.status} /> },
            { label: 'From', value: email.from_address, copy: true },
            { label: 'To', value: toList, copy: true },
            email.cc && { label: 'CC', value: email.cc },
            email.bcc && { label: 'BCC', value: email.bcc },
            email.reply_to && { label: 'Reply-To', value: email.reply_to },
            { label: 'Created', value: formatUnix(email.created_at) },
            email.sent_at && { label: 'Sent', value: formatUnix(email.sent_at) },
            email.message_id && { label: 'Message ID', value: email.message_id, copy: true },
          ].filter(Boolean).map((f: any) => (
            <div key={f.label} className="flex gap-3">
              <span className="text-[#555] w-24 shrink-0">{f.label}</span>
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {typeof f.value === 'string' ? (
                  <span className="text-white truncate font-mono text-xs">{f.value}</span>
                ) : f.value}
                {f.copy && typeof f.value === 'string' && <CopyButton text={f.value} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="flex border-b border-[#1a1a1a] bg-[#0a0a0a]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm transition-colors ${tab === t ? 'text-white border-b-2 border-primary' : 'text-[#555] hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="bg-[#0a0a0a]">
          {tab === 'Preview' && (
            email.html ? (
              <iframe
                srcDoc={email.html}
                className="w-full h-[500px] border-0"
                sandbox="allow-same-origin"
                title="Email Preview"
              />
            ) : (
              <div className="p-8 text-center text-[#555] text-sm">No HTML content</div>
            )
          )}
          {tab === 'Plain Text' && (
            <pre className="p-6 text-sm text-[#ccc] whitespace-pre-wrap overflow-auto max-h-96">
              {email.text_body || 'No plain text content'}
            </pre>
          )}
          {tab === 'Headers' && (
            <pre className="p-6 text-sm text-[#888] font-mono whitespace-pre-wrap overflow-auto max-h-96">
              {email.headers ? JSON.stringify(JSON.parse(email.headers || '{}'), null, 2) : 'No headers recorded'}
            </pre>
          )}
          {tab === 'Timeline' && (
            <div className="p-6">
              {events.length === 0 ? (
                <p className="text-sm text-[#555]">No events recorded</p>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-[#1a1a1a]" />
                  {events.map((ev: any, i) => (
                    <div key={i} className="relative flex items-start gap-4 mb-4 last:mb-0">
                      <div className={`absolute -left-4 w-5 h-5 rounded-full bg-[#111] border border-[#2a2a2a] flex items-center justify-center ${ev.color}`}>
                        {ev.icon}
                      </div>
                      <div>
                        <div className={`text-sm font-medium ${ev.color}`}>{ev.label}</div>
                        <div className="text-xs text-[#555]">{formatUnix(ev.ts, 'MMM d, yyyy HH:mm:ss')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tags */}
      {email.tags && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#555]">Tags:</span>
          {(typeof email.tags === 'string' ? JSON.parse(email.tags) : email.tags).map((tag: any, i: number) => (
            <span key={i} className="text-xs bg-[#1a1a1a] text-[#888] px-2 py-0.5 rounded border border-[#2a2a2a]">
              {tag.name}: {tag.value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
