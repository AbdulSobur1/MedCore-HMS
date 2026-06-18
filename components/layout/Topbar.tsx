'use client'

import { Bell, Menu } from 'lucide-react'

interface TopbarProps {
  title: string
  onMenuClick: () => void
  actions?: React.ReactNode
}

export function Topbar({ title, onMenuClick, actions }: TopbarProps) {
  return (
    <header className="h-14 bg-[--surface] border-b border-[--border] px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[--surface-2] transition-colors text-[--text-2]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-[15px] font-semibold text-[--text-1]">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {actions}
        <button className="relative p-2 rounded-lg hover:bg-[--surface-2] transition-colors">
          <Bell className="w-4 h-4 text-[--text-2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[--danger] rounded-full" />
        </button>
      </div>
    </header>
  )
}
