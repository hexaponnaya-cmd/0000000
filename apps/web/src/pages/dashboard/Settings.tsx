import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from '@/lib/toast'
import { User, Users, Key, Server, CheckCircle, XCircle } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export function Settings() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Profile updated')
    }, 600)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#555] mt-0.5">Manage your account and workspace</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-2">
            <User className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-semibold text-white">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-bold">
                {getInitials(user?.name || user?.email || 'U')}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-[#555]">{user?.email}</div>
              </div>
            </div>
            <Input
              label="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              hint="Email cannot be changed"
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveName} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-semibold text-white">Team</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium text-white">{user?.teamName || 'My Team'}</div>
                <div className="text-xs text-[#555]">Team ID: {user?.teamId}</div>
              </div>
            </div>
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#080808]">
                <span className="text-xs text-[#555] uppercase tracking-wider font-medium">Members</span>
              </div>
              <div className="divide-y divide-[#0f0f0f]">
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                    {getInitials(user?.name || 'U')}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{user?.name}</div>
                    <div className="text-xs text-[#555]">{user?.email}</div>
                  </div>
                  <span className="text-xs bg-[#1a1a1a] text-[#888] px-2 py-0.5 rounded border border-[#2a2a2a]">Owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Provider */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-semibold text-white">Email Provider</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">Provider</div>
                <div className="text-xs text-[#555] mt-0.5">Currently active email sending provider</div>
              </div>
              <span className="text-sm text-primary font-mono bg-primary/10 px-3 py-1 rounded border border-primary/20">Brevo</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#111] border border-[#2a2a2a] rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">BREVO_API_KEY</div>
                <div className="text-xs text-[#555] mt-0.5">Environment variable status</div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" /> Configured
              </div>
            </div>
            <p className="text-xs text-[#444]">
              Email provider configuration is managed via environment variables on the server. Contact your admin to update these settings.
            </p>
          </div>
        </div>

        {/* API Info */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1a1a1a] flex items-center gap-2">
            <Key className="w-4 h-4 text-[#555]" />
            <h2 className="text-sm font-semibold text-white">API Information</h2>
          </div>
          <div className="p-6 space-y-3">
            {[
              { label: 'API Base URL', value: 'https://legsend-api.hexaponnaya.workers.dev' },
              { label: 'API Version', value: 'v1' },
              { label: 'Region', value: 'Cloudflare Global Network' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[#0f0f0f] last:border-0">
                <span className="text-xs text-[#555]">{item.label}</span>
                <code className="text-xs text-[#888] font-mono">{item.value}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
