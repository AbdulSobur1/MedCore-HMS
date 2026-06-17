'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
}

interface SidebarProps {
  navItems: NavItem[]
  open: boolean
  onClose: () => void
}

export function Sidebar({ navItems, open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { session, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const initials = session?.name
    ? session.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar — always fixed, content area uses lg:pl-[220px] to clear it */}
      <aside
        className={`fixed left-0 top-0 h-screen w-[220px] z-40
          bg-[--surface] border-r border-[--border] flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-14 border-b border-[--border] px-4 flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 bg-[--accent] rounded-lg flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/>
            </svg>
          </div>
          <span className="font-semibold text-[--text-1] text-sm">MedCore</span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-[13px] font-medium transition-colors
                  ${isActive
                    ? 'bg-[--accent-soft] text-[--accent]'
                    : 'text-[--text-2] hover:bg-[--surface-2] hover:text-[--text-1]'
                  }`}
              >
                {isActive && (
                  <span className="absolute left-0 inset-y-1 w-0.5 bg-[--accent] rounded-r" />
                )}
                <Icon className="w-4 h-4 shrink-0" />
                <span className="sidebar-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom user section */}
        <div className="border-t border-[--border] p-3">
          <div className="flex items-center gap-2.5 px-1 mb-2">
            <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] text-[12px] font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[--text-1] truncate">{session?.name || 'User'}</p>
              <p className="text-[11px] text-[--text-3] capitalize">{session?.role || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-[--text-2] hover:bg-[--surface-2] hover:text-[--text-1] transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
