'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Calendar, Pill, CreditCard, Clock, User, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'

function f(n: number) { return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 }) }

export default function PatientDashboardPage() {
  const { session } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/appointments').then(r => r.ok ? r.json() : { appointments: [] }),
      fetch('/api/prescriptions').then(r => r.ok ? r.json() : { prescriptions: [] }),
      fetch('/api/invoices').then(r => r.ok ? r.json() : { invoices: [] }),
    ]).then(([a, p, i]) => {
      setAppointments(a.appointments || [])
      setPrescriptions(p.prescriptions || [])
      setInvoices(i.invoices || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const nextAppt = appointments
    .filter((a: any) => a.scheduledAt && new Date(a.scheduledAt) > new Date() && a.status !== 'cancelled')
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0]

  const activeRx = prescriptions.filter((r: any) => r.status === 'pending')
  const outstandingAmt = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue')
    .reduce((s: number, i: any) => s + Number(i.amount), 0)
  const lastVisit = appointments.filter((a: any) => a.status === 'confirmed')
    .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())[0]
  const recentAppts = appointments.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--text-1]">Good morning, {session?.name?.split(' ')[0]}</h1>
          <p className="text-[13px] text-[--text-3]">Patient ID: {session?.id?.slice(0, 8)}...</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-bold">
          {session?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-4">
          <p className="text-[11px] text-[--text-3] mb-1">Next Appointment</p>
          <p className="text-[15px] font-semibold text-[--text-1]">{nextAppt ? format(new Date(nextAppt.scheduledAt), 'dd MMM') : 'None'}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-4">
          <p className="text-[11px] text-[--text-3] mb-1">Active Rx</p>
          <p className="text-[15px] font-semibold text-[--text-1]">{activeRx.length}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-4">
          <p className="text-[11px] text-[--text-3] mb-1">Outstanding Bills</p>
          <p className="text-[15px] font-semibold text-[--warning]">{f(outstandingAmt)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-4">
          <p className="text-[11px] text-[--text-3] mb-1">Last Visit</p>
          <p className="text-[15px] font-semibold text-[--text-1]">{lastVisit?.scheduledAt ? format(new Date(lastVisit.scheduledAt), 'dd MMM') : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Next Appointment Card */}
          {nextAppt ? (
            <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-semibold text-[--text-1]">Next Appointment</h3>
                <StatusBadge status={nextAppt.status} />
              </div>
              <p className="text-[15px] font-medium text-[--text-1]">{nextAppt.type}</p>
              <p className="text-[13px] text-[--text-2]">{nextAppt.scheduledAt ? format(new Date(nextAppt.scheduledAt), 'dd MMM yyyy, hh:mm a') : '—'}</p>
              {nextAppt.doctorName && <p className="text-[13px] text-[--text-2]">Dr. {nextAppt.doctorName}</p>}
              <div className="flex gap-2 mt-4">
                <Link href="/patient/appointments" className="px-3 py-1.5 border border-[--border] rounded-lg text-[12px] hover:bg-[--surface-2]">Reschedule</Link>
                <Link href="/patient/appointments" className="px-3 py-1.5 border border-[--border] rounded-lg text-[12px] hover:bg-[--surface-2]">Cancel</Link>
              </div>
            </div>
          ) : (
            <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <EmptyState icon={Calendar} title="No upcoming appointments" action={
                <Link href="/patient/appointments" className="inline-flex px-4 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium">Book Appointment</Link>
              } />
            </div>
          )}

          {/* Recent Appointments */}
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-[--text-1]">Recent Appointments</h3>
              <Link href="/patient/appointments" className="text-[12px] text-[--accent] font-medium hover:underline">View all</Link>
            </div>
            {recentAppts.length === 0 ? (
              <p className="text-[13px] text-[--text-3] text-center py-4">No appointments yet</p>
            ) : (
              <div className="space-y-2">
                {recentAppts.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[--surface-2]">
                    <div>
                      <p className="text-[13px] font-medium text-[--text-1]">{a.type}</p>
                      <p className="text-[11px] text-[--text-3]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'dd MMM yyyy') : '—'}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Active Prescriptions */}
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[--text-1] mb-3">Active Prescriptions</h3>
            {activeRx.length === 0 ? (
              <p className="text-[13px] text-[--text-3] text-center py-4">No active prescriptions</p>
            ) : (
              <div className="space-y-2">
                {activeRx.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-[--surface-2]">
                    <Pill className="w-4 h-4 text-[--accent]" />
                    <div>
                      <p className="text-[12px] font-medium text-[--text-1]">{r.diagnosis}</p>
                      {r.drugs?.length > 0 && <p className="text-[10px] text-[--text-3]">{r.drugs.map((d: any) => d.drugName).join(', ')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href="/patient/prescriptions" className="block text-center mt-3 text-[12px] text-[--accent] font-medium hover:underline">View all</Link>
          </div>

          {/* Outstanding Bills */}
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[--text-1] mb-3">Outstanding Bills</h3>
            {outstandingAmt > 0 ? (
              <>
                <p className="text-xl font-bold text-[--warning]">{f(outstandingAmt)}</p>
                <Link href="/patient/billing" className="inline-flex mt-3 px-4 py-2 bg-[--accent] text-white rounded-lg text-[12px] font-medium hover:bg-[--accent-hover]">Pay Now</Link>
              </>
            ) : (
              <p className="text-[13px] text-[--text-3] text-center py-4">No outstanding bills</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
