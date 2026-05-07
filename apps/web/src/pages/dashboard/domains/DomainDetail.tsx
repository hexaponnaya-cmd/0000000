import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, XCircle, Copy, RefreshCw, Globe } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { CopyButton } from '@/components/shared/CopyButton'
import { Button } from '@/components/ui/Button'
import { formatUnix } from '@/lib/utils'

export function DomainDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [domain, setDomain] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (!id) return
    api.getDomain(id).then((res: any) => {
      setDomain(res.domain || res)
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }, [id])

  const handleVerify = async () => {
    if (!id) return
    setVerifying(true)
    try {
      const res: any = await api.verifyDomain(id)
      const v = res.verification || res
      if (v.spf && v.dkim && v.dmarc) {
        toast.success('All DNS records verified! Domain is active.')
      } else {
        const missing = [!v.spf && 'SPF', !v.dkim && 'DKIM', !v.dmarc && 'DMARC'].filter(Boolean)
        toast.info(`Verification pending. Missing: ${missing.join(', ')}`)
      }
      // Refresh domain
      const fresh: any = await api.getDomain(id)
      setDomain(fresh.domain || fresh)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setVerifying(false)
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

  if (!domain) return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="text-center py-16 text-[#555]">Domain not found</div>
    </div>
  )

  const dnsRecords = domain.dns_records || []

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-[#555] hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Domains
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center">
          <Globe className="w-5 h-5 text-[#555]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white">{domain.name}</h1>
            <StatusBadge status={domain.status} />
          </div>
          <p className="text-xs text-[#555] mt-0.5">Added {formatUnix(domain.created_at)}</p>
        </div>
        <Button onClick={handleVerify} loading={verifying} variant="secondary" size="sm">
          <RefreshCw className="w-3.5 h-3.5" /> Verify DNS
        </Button>
      </div>

      {/* Verification status */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'SPF', verified: !!domain.spf_verified },
          { label: 'DKIM', verified: !!domain.dkim_verified },
          { label: 'DMARC', verified: !!domain.dmarc_verified },
        ].map(rec => (
          <div key={rec.label} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 flex items-center gap-3">
            {rec.verified
              ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
              : <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
            }
            <div>
              <div className="text-sm font-medium text-white">{rec.label}</div>
              <div className={`text-xs ${rec.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                {rec.verified ? 'Verified' : 'Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DNS Records */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-semibold text-white">DNS Records</h2>
          <p className="text-xs text-[#555] mt-0.5">Add these records to your DNS provider to verify your domain</p>
        </div>
        {dnsRecords.length === 0 ? (
          <div className="p-6 text-sm text-[#555]">No DNS records available. Try refreshing the page.</div>
        ) : (
          <div className="divide-y divide-[#0f0f0f]">
            {dnsRecords.map((rec: any, i: number) => (
              <div key={i} className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono bg-blue-900/30 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded">{rec.type}</span>
                  <span className="text-sm text-[#888]">{rec.purpose}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-[#555] mb-1.5 uppercase tracking-wider">Host / Name</div>
                    <div className="flex items-center gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
                      <code className="flex-1 text-xs text-[#ccc] font-mono break-all">{rec.name}</code>
                      <CopyButton text={rec.name} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#555] mb-1.5 uppercase tracking-wider">Value</div>
                    <div className="flex items-start gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2">
                      <code className="flex-1 text-xs text-[#ccc] font-mono break-all">{rec.value}</code>
                      <CopyButton text={rec.value} className="shrink-0 mt-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3">Setup Instructions</h3>
        <ol className="space-y-2 text-sm text-[#888] list-decimal list-inside">
          <li>Log in to your DNS provider (Cloudflare, Namecheap, Route53, etc.)</li>
          <li>Navigate to the DNS management section for <strong className="text-white">{domain.name}</strong></li>
          <li>Add each of the TXT records above exactly as shown</li>
          <li>Save your changes and wait for DNS propagation (5–30 minutes)</li>
          <li>Click <strong className="text-white">Verify DNS</strong> above to check the records</li>
        </ol>
        <p className="text-xs text-[#555] mt-3">DNS propagation may take up to 48 hours in some cases.</p>
      </div>
    </div>
  )
}
