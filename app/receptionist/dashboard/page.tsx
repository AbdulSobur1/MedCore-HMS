'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function ReceptionistDashboardPage() {
  const { session } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then(r => r.ok ? r.json() : { appointments: [] }),
      fetch('/api/patients').then(r => r.ok ? r.json() : { patients: [] }),
    ]).then(([a, p]) => {
      setAppointments(a.appointments || [])
      setPatients(p.patients || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const todayAppts = appointments.filter((a: any) => {
    if (!a.scheduledAt) return false
    const d = new Date(a.scheduledAt)
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  })

  const pendingAppts = appointments.filter((a: any) => a.status === 'pending')
  const confirmedToday = todayAppts.filter((a: any) => a.status === 'confirmed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[--text-1]">Receptionist Dashboard</h1>
        <p className="text-[13px] text-[--text-3]">Welcome, {session?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Today's Appointments" value={todayAppts.length.toString()} color="accent" />
        <StatCard icon={Users} label="Total Patients" value={patients.length.toString()} color="info" />
        <StatCard icon={Clock} label="Pending Appointments" value={pendingAppts.length.toString()} color="warning" />
        <StatCard icon={CheckCircle} label="Checked In Today" value={confirmedToday.length.toString()} color="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Today's Appointments */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Today's Appointments</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : todayAppts.length === 0 ? (
            <EmptyState icon={Calendar} title="No appointments today" description="New bookings will appear here" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Time</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Patient</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Doctor</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {todayAppts.map((a: any) => (
                    <tr key={a.id} className="hover:bg-[--surface-2]">
                      <td className="py-2.5 px-3 text-[--text-1]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'hh:mm a') : '—'}</td>
                      <td className="py-2.5 px-3 font-medium text-[--text-1]">{a.patientName || a.patientLastName || 'Unknown'}</td>
                      <td className="py-2.5 px-3 text-[--text-2] hidden md:table-cell">{a.doctorName || '—'}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Recent Patients</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : patients.length === 0 ? (
            <p className="text-[13px] text-[--text-3] text-center py-8">No patients registered yet</p>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {patients.slice(0, 8).map((p: any) => (
                <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[--surface-2] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] text-[11px] font-semibold shrink-0">
                    {p.firstName?.[0]}{p.lastName?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[--text-1] truncate">{p.firstName} {p.lastName}</p>
                    <p className="text-[11px] text-[--text-3]">{p.patientCode}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
