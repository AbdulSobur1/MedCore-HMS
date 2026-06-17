'use client'

import { format } from 'date-fns'
import { Users, Calendar, ShieldCheck, CreditCard, Eye } from 'lucide-react'
import { AdminCharts } from '@/components/charts/AdminCharts'
import { StatusBadge } from '@/components/ui/StatusBadge'
import Link from 'next/link'

interface Props {
  totalPatients: number
  todayAppts: number
  activeStaff: number
  pendingInvoices: number
  weeklyData: { day: string; admitted: number; discharged: number }[]
  departmentData: { name: string; count: number }[]
  recentPatients: any[]
  todayAppointments: any[]
}

function formatNGN(kobo: number) {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

export function AdminDashboardClient({
  totalPatients, todayAppts, activeStaff, pendingInvoices,
  weeklyData, departmentData, recentPatients, todayAppointments
}: Props) {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={totalPatients.toLocaleString()} delta="+12%" color="accent" />
        <StatCard icon={Calendar} label="Today's Appts" value={todayAppts.toString()} delta={`${todayAppointments.length} scheduled`} color="info" />
        <StatCard icon={ShieldCheck} label="Active Staff" value={activeStaff.toString()} delta="All departments" color="success" />
        <StatCard icon={CreditCard} label="Pending Invoices" value={pendingInvoices.toString()} delta="Awaiting payment" color="warning" />
      </div>

      {/* Charts */}
      <AdminCharts weeklyData={weeklyData} departmentData={departmentData} />

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Recent Patients */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-[--text-1]">Recent Patients</h3>
            <Link href="/admin/patients" className="text-[11px] text-[--accent] font-medium hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[--border]">
                  <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3]">Patient</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3]">Code</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3] hidden sm:table-cell">Doctor</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3]">Status</th>
                  <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[--text-3] hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {recentPatients.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[--surface-2] transition-colors">
                    <td className="py-2.5 px-3 text-[--text-1] font-medium">{p.name}</td>
                    <td className="py-2.5 px-3 text-[--text-2]">{p.patientCode}</td>
                    <td className="py-2.5 px-3 text-[--text-2] hidden sm:table-cell">{p.doctorName || '—'}</td>
                    <td className="py-2.5 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-2.5 px-3 text-[--text-3] hidden sm:table-cell">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-[--text-1]">Today's Appts</h3>
            <Link href="/admin/appointments" className="text-[11px] text-[--accent] font-medium hover:underline">View all</Link>
          </div>
          <div className="max-h-[380px] overflow-y-auto space-y-2">
            {todayAppointments.length === 0 ? (
              <p className="text-[13px] text-[--text-3] text-center py-8">No appointments today</p>
            ) : (
              todayAppointments.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[--surface-2] transition-colors">
                  <div className="text-[11px] font-medium text-[--text-2] whitespace-nowrap w-14 pt-0.5">{a.time}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[--text-1] truncate">{a.patientName || 'Unknown'}</p>
                    <p className="text-[11px] text-[--text-3] truncate">{a.type}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, delta, color }: {
  icon: any; label: string; value: string; delta: string; color: string
}) {
  const colorMap: Record<string, string> = {
    accent: 'bg-[--accent-soft] text-[--accent]',
    info: 'bg-[--info-soft] text-[--info]',
    success: 'bg-[--success-soft] text-[--success]',
    warning: 'bg-[--warning-soft] text-[--warning]',
  }
  return (
    <div className="bg-[--surface] rounded-xl border border-[--border] p-5 flex items-start justify-between">
      <div>
        <p className="text-[11px] uppercase tracking text-[--text-3] mb-1">{label}</p>
        <p className="text-[28px] font-semibold text-[--text-1] leading-none mb-1">{value}</p>
        <p className="text-[12px] text-[--text-3]">{delta}</p>
      </div>
      <div className={`w-9 h-9 rounded-lg ${colorMap[color] || colorMap.accent} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
  )
}
