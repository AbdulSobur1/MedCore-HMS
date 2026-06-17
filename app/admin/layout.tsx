'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import {
  LayoutDashboard, Users, Calendar, Stethoscope,
  Pill, CreditCard, BarChart3, ShieldCheck
} from 'lucide-react'
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Patients', icon: Users, href: '/admin/patients' },
  { label: 'Appointments', icon: Calendar, href: '/admin/appointments' },
  { label: 'Doctors', icon: Stethoscope, href: '/admin/doctors' },
  { label: 'Pharmacy', icon: Pill, href: '/admin/pharmacy' },
  { label: 'Billing', icon: CreditCard, href: '/admin/billing' },
  { label: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'Staff Mgmt', icon: ShieldCheck, href: '/admin/users' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { session, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen bg-[--bg] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[--accent] border-t-transparent rounded-full" />
    </div>
  }

  if (!session) return null

  const title = `Admin - ${session.name}`

  return (
    <div className="min-h-screen bg-[--bg]">
      <Sidebar navItems={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pl-0 lg:pl-[220px] flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
