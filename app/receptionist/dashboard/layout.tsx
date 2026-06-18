'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { LayoutDashboard, Calendar, Users } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/receptionist/dashboard' },
  { label: 'Appointments', icon: Calendar, href: '/receptionist/appointments' },
  { label: 'Patients', icon: Users, href: '/receptionist/patients' },
]

export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen bg-[--bg] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[--accent] border-t-transparent rounded-full" />
    </div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[--bg] flex">
      <Sidebar navItems={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 min-h-screen lg:ml-[220px]">
        <Topbar title={`Receptionist - ${session.name}`} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
