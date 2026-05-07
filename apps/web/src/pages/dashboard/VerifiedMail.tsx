import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldX, Globe, Mail, AlertTriangle, CheckCircle, RefreshCw, ArrowRight, Lock, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { VerifiedBadge } from '@/components/shared/VerifiedBadge'
import { cn } from '@/lib/utils'

interface DomainRecord {
  id: string
  name: string
  status: string
  spf_verified?: boolean
  dkim_verified?: boolean
  dmarc_verified?: boolean
  created_at: number
}

function VerificationStep({
  label,
  done,
  description,
}: {
  label: string
  done: boolean
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
          done ? 'bg-green-500/20 text-green-400' : 'bg-[#1a1a1a] text-[#555]'
        )}
      >
        {done ? <CheckCircle className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      </div>
      <div>
        <p className={cn('text-sm font-medium', done ? 'text-white' : 'text-[#888]')}>{label}</p>
        <p className="text-xs text-[#555] mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function DomainCard({
  domain,
  onVerify,
  verifying,
}: {
  domain: DomainRecord
  onVerify: (id: string) => void
  verifying: boolean
}) {
  const allVerified =
    domain.spf_verified && domain.dkim_verified && domain.dmarc_verified
  const anyVerified =
    domain.spf_verified || domain.dkim_verified || domain.dmarc_verified

  return (
    <div
      className={cn(
        'bg-[#0a0a0a] border rounded-xl p-5 transition-all duration-200',
        allVerified
          ? 'border-[#6366f1]/30 shadow-[0_0_20px_rgba(99,102,241,0.06)]'
          : anyVerified
          ? 'border-yellow-500/20'
          : 'border-[#1a1a1a]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
              allVerified ? 'bg-[#6366f1]/10' : 'bg-[#111]'
            )}
          >
            <Globe
              className={cn(
                'w-4 h-4',
                allVerified ? 'text-[#6366f1]' : 'text-[#555]'
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{domain.name}</span>
              {allVerified && <VerifiedBadge size="sm" showLabel />}
            </div>
            <p className="text-xs text-[#555] mt-0.5">
              {allVerified
                ? 'Fully verified — ready for sending'
                : anyVerified
                ? 'Partial verification — some records missing'
                : 'Pending verification'}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={allVerified ? 'ghost' : 'secondary'}
          onClick={() => onVerify(domain.id)}
          loading={verifying}
          className="flex-shrink-0"
        >
          <RefreshCw className={cn('w-3.5 h-3.5', verifying && 'animate-spin')} />
          {allVerified ? 'Re-check' : 'Verify'}
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        <VerificationStep
          label="SPF Record"
          done={!!domain.spf_verified}
          description="Authorizes your server to send email for this domain"
        />
        <VerificationStep
          label="DKIM Signature"
          done={!!domain.dkim_verified}
          description="Cryptographically signs outgoing messages"
        />
        <VerificationStep
          label="DMARC Policy"
          done={!!domain.dmarc_verified}
          description="Tells receivers what to do with unauthenticated email"
        />
      </div>

      {allVerified && (
        <div className="mt-5 flex items-center gap-2 bg-[#6366f1]/8 border border-[#6366f1]/20 rounded-lg px-3 py-2">
          <ShieldCheck className="w-4 h-4 text-[#6366f1]" />
          <span className="text-xs text-[#6366f1] font-medium">
            Meta Verified Sender — Emails from this domain display a verified badge
          </span>
        </div>
      )}
    </div>
  )
}

export function VerifiedMail() {
  const [domains, setDomains] = useState<DomainRecord[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchDomains()
  }, [])

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      const res: any = await api.verifyDomain(id)
      const result = res.verification || res
      const spf = result.spf ?? false
      const dkim = result.dkim ?? false
      const dmarc = result.dmarc ?? false
      const allOk = spf && dkim && dmarc

      setDomains(prev =>
        prev.map(d =>
          d.id === id
            ? { ...d, spf_verified: spf, dkim_verified: dkim, dmarc_verified: dmarc, status: allOk ? 'verified' : 'pending' }
            : d
        )
      )

      if (allOk) {
        toast.success('🎉 Domain fully verified! Meta Verified badge enabled.')
      } else {
        toast.info(
          `Verification: SPF ${spf ? '✓' : '✗'}  DKIM ${dkim ? '✓' : '✗'}  DMARC ${dmarc ? '✓' : '✗'}`
        )
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setVerifyingId(null)
    }
  }

  const verifiedCount = domains.filter(
    d => d.spf_verified && d.dkim_verified && d.dmarc_verified
  ).length

  const benefits = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-[#6366f1]" />,
      title: 'Meta Verified Badge',
      desc: 'Recipients see a blue shield next to your sender name in supported mail clients.',
    },
    {
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      title: 'Higher Deliverability',
      desc: 'Authenticated emails bypass spam filters and land in the primary inbox.',
    },
    {
      icon: <Lock className="w-4 h-4 text-green-400" />,
      title: 'Anti-Spoofing Protection',
      desc: 'DMARC prevents bad actors from impersonating your domain.',
    },
    {
      icon: <Mail className="w-4 h-4 text-blue-400" />,
      title: 'Brand Trust',
      desc: 'Verified sender status builds recipient confidence and improves open rates.',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-xl font-semibold text-white">Verified Mail</h1>
          <span className="inline-flex items-center gap-1.5 bg-[#6366f1]/10 border border-[#6366f1]/20 rounded-full px-2.5 py-0.5 text-xs text-[#6366f1] font-medium">
            <ShieldCheck className="w-3 h-3" /> Meta Verified
          </span>
        </div>
        <p className="text-sm text-[#555]">
          Authenticate your domains with SPF, DKIM, and DMARC to earn the Meta Verified sender badge.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <p className="text-xs text-[#555] mb-1">Total Domains</p>
          <p className="text-2xl font-semibold text-white">{loading ? '—' : domains.length}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <p className="text-xs text-[#555] mb-1">Verified</p>
          <p className="text-2xl font-semibold text-[#6366f1]">{loading ? '—' : verifiedCount}</p>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <p className="text-xs text-[#555] mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-400">{loading ? '—' : domains.length - verifiedCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Domain list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Your Domains</h2>
            <Button size="sm" variant="ghost" onClick={fetchDomains} disabled={loading}>
              <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 h-40 animate-pulse" />
              ))}
            </div>
          ) : domains.length === 0 ? (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-10 text-center">
              <ShieldX className="w-8 h-8 text-[#555] mx-auto mb-3" />
              <p className="text-white font-medium mb-1">No domains configured</p>
              <p className="text-sm text-[#555] mb-4">
                Go to Domains to add your sending domain first.
              </p>
              <Button size="sm" onClick={() => (window.location.href = '/dashboard/domains')}>
                Add Domain <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            domains.map(d => (
              <DomainCard
                key={d.id}
                domain={d}
                onVerify={handleVerify}
                verifying={verifyingId === d.id}
              />
            ))
          )}
        </div>

        {/* Right: Info panel */}
        <div className="space-y-4">
          {/* What is Meta Verified */}
          <div className="bg-[#0a0a0a] border border-[#6366f1]/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#6366f1]" />
              <h3 className="text-sm font-semibold text-white">What is Meta Verified?</h3>
            </div>
            <p className="text-xs text-[#888] leading-relaxed">
              The Meta Verified Sender program authenticates your email identity across SPF,
              DKIM, and DMARC protocols — the same standards used by Google, Microsoft, and
              Apple. Verified senders get a blue shield badge that displays to recipients.
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Benefits</h3>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{b.icon}</div>
                  <div>
                    <p className="text-xs font-medium text-white">{b.title}</p>
                    <p className="text-xs text-[#555] mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DNS records cheat sheet */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">DNS Records Required</h3>
            <div className="space-y-3">
              <div className="bg-[#111] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">SPF</span>
                  <span className="text-[10px] text-[#555]">TXT record</span>
                </div>
                <code className="text-[10px] text-[#888] break-all">v=spf1 include:_spf.legsend.app ~all</code>
              </div>
              <div className="bg-[#111] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">DKIM</span>
                  <span className="text-[10px] text-[#555]">TXT record at legsend._domainkey</span>
                </div>
                <code className="text-[10px] text-[#888] break-all">Retrieved from Domains → your domain → DNS records</code>
              </div>
              <div className="bg-[#111] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-green-400 uppercase tracking-wide">DMARC</span>
                  <span className="text-[10px] text-[#555]">TXT record at _dmarc</span>
                </div>
                <code className="text-[10px] text-[#888] break-all">v=DMARC1; p=quarantine; rua=mailto:dmarc@legsend.app</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
