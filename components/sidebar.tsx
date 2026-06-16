'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Users, Calendar, Pill, DollarSign, BarChart3, Settings, LogOut, Menu, X, Stethoscope } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'receptionist' | 'accountant' | 'admin'

const ALL_NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { label: 'Patients', icon: Users, id: 'patients' },
  { label: 'Appointments', icon: Calendar, id: 'appointments' },
  { label: 'Doctors', icon: Stethoscope, id: 'doctors' },
  { label: 'Pharmacy', icon: Pill, id: 'pharmacy' },
  { label: 'Billing', icon: DollarSign, id: 'billing' },
  { label: 'Reports', icon: BarChart3, id: 'reports' },
  { label: 'Admin', icon: Settings, id: 'admin' },
]

const ROLE_ACCESS: Record<Exclude<UserRole, 'patient'>, string[]> = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'pharmacy', 'billing', 'reports', 'admin'],
  doctor: ['dashboard', 'patients', 'appointments'],
  pharmacist: ['dashboard', 'pharmacy'],
  receptionist: ['dashboard', 'patients', 'appointments'],
  accountant: ['dashboard', 'billing', 'reports'],
}

export function Sidebar({ activeSection, onNavigate, userRole }: { activeSection: string; onNavigate: (id: string) => void; userRole?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const allowedSections = ROLE_ACCESS[(userRole as Exclude<UserRole, 'patient'>) || 'doctor'] || ['dashboard']
  const navigationItems = ALL_NAVIGATION_ITEMS.filter(item => allowedSections.includes(item.id))

  const handleNavigation = (id: string) => {
    onNavigate(id)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push('/auth/landing')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-8 border-b border-sidebar-border">
          <h1 className="text-2xl font-light tracking-tight text-sidebar-foreground">MedCore</h1>
          <p className="text-xs text-sidebar-foreground/50 mt-2 font-light">Hospital Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border px-4 py-4 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Spacer */}
      <div className="hidden lg:block w-64 flex-shrink-0" />
    </>
  )
}
