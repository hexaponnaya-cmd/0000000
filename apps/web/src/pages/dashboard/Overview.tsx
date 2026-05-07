import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle, Eye, AlertTriangle, Globe } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from '@/lib/toast'
import { StatsCard } from '@/components/shared/StatsCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatUnix, truncate } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays } from 'date-fns'

export function Overview() {
  const navigate = useNavigate()
  const [emails, setEmails] = useState<any[]>([])
  const [domains, setDomains] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.listEmails({ per_page: '100' }),
      api.listDomains(),
    ]).then(([emailsRes, domainsRes]: any[]) => {
      setEmails(emailsRes.data || emailsRes || [])
      setDomains(domainsRes.data || domainsRes || [])
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false))
  }, [])

  const stats = {
    sent: emails.filter(e => ['sent', 'delivered', 'opened', 'clicked'].includes(e.status)).length,
    delivered: emails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length,
    opened: emails.filter(e => ['opened', 'clicked'].includes(e.status)).length,
    bounced: emails.filter(e => e.status === 'bounced').length,
  }

  // Build chart data — group by day
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i)
    const key = format(d, 'MMM d')
    const dayEmails = emails.filter(e => {
      const ts = e.created_at
      if (!ts) return false
      const ed = new Date(typeof ts === 'number' ? ts * 1000 : ts)
      return format(ed, 'MMM d') === key
    })
    return {
      date: key,
      sent: dayEmails.length,
      delivered: dayEmails.filter(e => ['delivered', 'opened', 'clicked'].includes(e.status)).length,
    }
  })

  const recent = [...emails].sort((a, b) => (b.created_at || 0) - (a.created_at || 0)).slice(0, 10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-[#555] mt-0.5">Your sending activity at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Sent" value={stats.sent} icon={<Mail className="w-4 h-4" />} iconColor="text-primary" loading={loading} />
        <StatsCard label="Delivered" value={stats.delivered} icon={<CheckCircle className="w-4 h-4" />} iconColor="text-green-400" loading={loading} />
        <StatsCard label="Opened" value={stats.opened} icon={<Eye className="w-4 h-4" />} iconColor="text-blue-400" loading={loading} />
        <StatsCard label="Bounced" value={stats.bounced} icon={<AlertTriangle className="w-4 h-4" />} iconColor="text-red-400" loading={loading} />
      </div>

      {/* Chart */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">Email activity (14 days)</h2>
        {loading ? (
          <div className="h-48 skeleton rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last14}>
              <defs>
                <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="delivGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis dataKey="date" tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#555', fontSize: 11 }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 12 }}
                cursor={{ stroke: '#2a2a2a' }}
              />
              <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={2} fill="url(#sentGrad)" name="Sent" />
              <Area type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} fill="url(#delivGrad)" name="Delivered" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent emails */}
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-white">Recent Emails</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded" />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#555]">No emails sent yet</div>
          ) : (
            <div className="divide-y divide-[#0f0f0f]">
              {recent.map(email => (
                <div
                  key={email.id}
                  className="px-5 py-3 hover:bg-[#0d0d0d] cursor-pointer flex items-center gap-4 transition-colors"
                  onClick={() => navigate(`/dashboard/emails/${email.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-[#888] truncate">{email.from_address}</span>
                      <span className="text-[#333] text-xs">→</span>
                      <span className="text-xs text-[#888] truncate">{Array.isArray(email.to_addresses) ? email.to_addresses[0] : email.to_addresses}</span>
                    </div>
                    <div className="text-sm text-white truncate">{email.subject}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={email.status} />
                    <span className="text-xs text-[#555]">{formatUnix(email.created_at, 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Domain health */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1a1a1a]">
            <h2 className="text-sm font-semibold text-white">Domain Health</h2>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 rounded" />)}
            </div>
          ) : domains.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-[#555] mb-3">No domains configured</p>
              <button onClick={() => navigate('/dashboard/domains')} className="text-xs text-primary hover:underline">
                Add a domain →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#0f0f0f]">
              {domains.map((d: any) => (
                <div key={d.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#0d0d0d] cursor-pointer" onClick={() => navigate(`/dashboard/domains/${d.id}`)}>
                  <Globe className="w-4 h-4 text-[#555] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{d.name}</div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
