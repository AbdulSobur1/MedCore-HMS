'use client'

import { Bell, Menu } from 'lucide-react'

interface TopbarProps {
  title: string
  onMenuClick: () => void
  actions?: React.ReactNode
}

export function Topbar({ title, onMenuClick, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[--border] bg-[--surface] px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="shrink-0 rounded-lg p-1.5 text-[--text-2] transition-colors hover:bg-[--surface-2] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="truncate text-[14px] font-semibold text-[--text-1] sm:text-[15px]">{title}</h2>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <button className="relative rounded-lg p-2 transition-colors hover:bg-[--surface-2]" aria-label="Notifications">
          <Bell className="w-4 h-4 text-[--text-2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[--danger] rounded-full" />
        </button>
      </div>
    </header>
  )
}
