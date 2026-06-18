'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Users, Calendar, FileText, Clock } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function DoctorDashboardPage() {
  const { session } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    Promise.all([
      fetch('/api/appointments').then(r => r.ok && r.json()),
      fetch('/api/patients').then(r => r.ok && r.json()),
      fetch('/api/prescriptions').then(r => r.ok && r.json()),
    ]).then(([a, p, rx]) => {
      if (a) setAppointments(a.appointments || [])
      if (p) setPatients(p.patients || [])
      if (rx) setPrescriptions(rx.prescriptions || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [session])

  const todayAppts = appointments.filter((a: any) => {
    if (!a.scheduledAt) return false
    const d = new Date(a.scheduledAt)
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  })

  const pendingRx = prescriptions.filter((r: any) => r.status === 'pending')
  const doneToday = todayAppts.filter((a: any) => a.status === 'confirmed')

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">Doctor Dashboard</h1><p className="text-[13px] text-[--text-3]">Welcome, {session?.name}</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Assigned Patients" value={patients.length.toString()} color="accent" />
        <StatCard icon={Calendar} label="Today's Appointments" value={todayAppts.length.toString()} color="info" />
        <StatCard icon={FileText} label="Pending Prescriptions" value={pendingRx.length.toString()} color="warning" />
        <StatCard icon={Clock} label="Done Today" value={doneToday.length.toString()} color="success" />
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Today's Appointments</h3>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[--surface-2] rounded animate-pulse" />)}</div>
        ) : todayAppts.length === 0 ? (
          <EmptyState icon={Calendar} title="No appointments today" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead><tr className="border-b border-[--border]">
                <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Time</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Patient</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Type</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3] w-28">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-[--border]">
                {todayAppts.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[--surface-2]">
                    <td className="py-2.5 px-3 text-[--text-1]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'hh:mm a') : '—'}</td>
                    <td className="py-2.5 px-3 font-medium text-[--text-1]">{a.patientName || a.patientLastName || 'Unknown'}</td>
                    <td className="py-2.5 px-3 text-[--text-2] hidden md:table-cell">{a.type}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => router.push(`/doctor/consultation/${a.id}`)}
                        className="px-3 py-1.5 bg-[--accent] text-white rounded-lg text-[11px] font-medium hover:bg-[--accent-hover]">
                        Start Consult
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


