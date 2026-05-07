import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Mail, Globe, Key, Users, Megaphone,
  Webhook, ScrollText, FileText, Settings, LogOut, Menu, X, ChevronDown
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import { Logo } from '@/components/Logo'

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/overview' },
  { icon: Mail, label: 'Emails', path: '/dashboard/emails' },
  { icon: Globe, label: 'Domains', path: '/dashboard/domains' },
  { icon: Key, label: 'API Keys', path: '/dashboard/api-keys' },
  { icon: Users, label: 'Audiences', path: '/dashboard/audiences' },
  { icon: Megaphone, label: 'Broadcasts', path: '/dashboard/broadcasts' },
  { icon: Webhook, label: 'Webhooks', path: '/dashboard/webhooks' },
  { icon: ScrollText, label: 'Logs', path: '/dashboard/logs' },
  { icon: FileText, label: 'Templates', path: '/dashboard/templates' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#1a1a1a]">
        <Logo className="h-6 w-auto" />
        {onMobileClose && (
          <button onClick={onMobileClose} className="lg:hidden text-[#555] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
              isActive
                ? 'bg-[#161616] text-white'
                : 'text-[#888] hover:text-white hover:bg-[#0f0f0f]'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#1a1a1a] p-3 space-y-0.5">
        <NavLink
          to="/dashboard/settings"
          onClick={onMobileClose}
          className={({ isActive }) => cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
            isActive ? 'bg-[#161616] text-white' : 'text-[#888] hover:text-white hover:bg-[#0f0f0f]'
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          Settings
        </NavLink>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[#888] hover:text-white hover:bg-[#0f0f0f] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {getInitials(user?.name || user?.email || 'U')}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-xs text-white font-medium truncate">{user?.name || 'Account'}</div>
              <div className="text-xs text-[#555] truncate">{user?.email}</div>
            </div>
            <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#111] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-[#1a1a1a] mb-1">
                <div className="text-xs text-white font-medium">{user?.teamName || 'My Team'}</div>
                <div className="text-xs text-[#555]">Team workspace</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-900/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-[#0a0a0a] border-r border-[#1a1a1a] h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-[240px] bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
