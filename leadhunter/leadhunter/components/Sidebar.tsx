'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Target, LayoutDashboard, Crosshair, Search, FileText, Settings, Tag, Globe, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: Crosshair },
  { href: '/keywords', label: 'Keywords', icon: Tag },
  { href: '/groups', label: 'Groups', icon: Globe },
  { href: '/analyzer', label: 'Analyzer', icon: Search },
  { href: '/proposals', label: 'Proposals', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-border-default">
        <div className="w-8 h-8 bg-accent-blue rounded-lg flex items-center justify-center flex-shrink-0">
          <Target size={16} className="text-white" />
        </div>
        <span className="text-white font-bold text-base tracking-tight">LeadHunter</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent-blue/15 text-accent-light border border-accent-blue/20'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-bg-tertiary'
              )}
            >
              <Icon size={16} className={active ? 'text-accent-blue' : ''} />
              {label}
              {label === 'Leads' && (
                <span className="ml-auto bg-accent-blue/20 text-accent-light text-xs px-1.5 py-0.5 rounded-md">New</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border-default">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-bg-secondary border-r border-border-default h-screen sticky top-0 flex-shrink-0">
        <NavContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-bg-secondary border border-border-default rounded-xl p-2.5"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} className="text-white" /> : <Menu size={18} className="text-white" />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-border-default z-50 flex flex-col">
            <NavContent />
          </aside>
        </>
      )}
    </>
  )
}
