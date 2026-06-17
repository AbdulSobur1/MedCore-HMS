'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { LayoutDashboard, FileText, Calendar, Pill, CreditCard, User } from 'lucide-react'
const navItems = [
  { label: 'Home', icon: LayoutDashboard, href: '/patient/dashboard' },
  { label: 'My Records', icon: FileText, href: '/patient/records' },
  { label: 'Appointments', icon: Calendar, href: '/patient/appointments' },
  { label: 'Prescriptions', icon: Pill, href: '/patient/prescriptions' },
  { label: 'My Bills', icon: CreditCard, href: '/patient/billing' },
  { label: 'Profile', icon: User, href: '/patient/profile' },
]

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen bg-[--bg] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[--accent] border-t-transparent rounded-full" />
    </div>
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-[--bg]">
      <Sidebar navItems={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pl-0 lg:pl-[220px] flex flex-col min-h-screen">
        <Topbar title={`Patient - ${session.name}`} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
