'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Sidebar } from '@/components/sidebar'
import { Topbar } from '@/components/topbar'
import { DashboardSection } from '@/components/dashboard-section'
import { PatientsSection } from '@/components/patients-section'
import { AppointmentsSection } from '@/components/appointments-section'
import { DoctorsSection } from '@/components/doctors-section'
import { PharmacySection } from '@/components/pharmacy-section'
import { BillingSection } from '@/components/billing-section'
import { ReportsSection } from '@/components/reports-section'
import { AdminSection } from '@/components/admin-section'

type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'receptionist' | 'accountant' | 'admin'

const ROLE_ACCESS: Record<string, string[]> = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'pharmacy', 'billing', 'reports', 'admin'],
  doctor: ['dashboard', 'patients', 'appointments'],
  pharmacist: ['dashboard', 'pharmacy'],
  receptionist: ['dashboard', 'patients', 'appointments'],
  accountant: ['dashboard', 'billing', 'reports'],
}

export default function StaffDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/landing')
    }
  }, [session, isLoading, router])

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const getAvailableSections = () => {
    return ROLE_ACCESS[session.role || 'doctor'] || ['dashboard']
  }

  const renderSection = () => {
    const allowed = getAvailableSections()
    if (!allowed.includes(activeSection)) return <DashboardSection />

    switch (activeSection) {
      case 'dashboard':
        return <DashboardSection />
      case 'patients':
        return <PatientsSection />
      case 'appointments':
        return <AppointmentsSection />
      case 'doctors':
        return <DoctorsSection />
      case 'pharmacy':
        return <PharmacySection />
      case 'billing':
        return <BillingSection />
      case 'reports':
        return <ReportsSection />
      case 'admin':
        return <AdminSection />
      default:
        return <DashboardSection />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} userRole={session.role} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto pt-20 lg:pt-24">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
