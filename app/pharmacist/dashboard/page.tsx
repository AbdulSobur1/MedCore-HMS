'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Pill, ClipboardList, TrendingDown, CheckCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PharmacistDashboardPage() {
  const { session } = useAuth()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [drugs, setDrugs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/prescriptions').then(r => r.ok ? r.json() : { prescriptions: [] }),
      fetch('/api/drugs').then(r => r.ok ? r.json() : { drugs: [] }),
    ]).then(([rx, d]) => {
      setPrescriptions(rx.prescriptions || [])
      setDrugs(d.drugs || [])
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false))
  }, [])

  const pendingRx = prescriptions.filter((r: any) => r.status === 'pending')
  const dispensedToday = prescriptions.filter((r: any) => r.status === 'dispensed')
  const lowStock = drugs.filter((d: any) => d.quantity <= d.reorderLevel)
  const totalDrugs = drugs.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[--text-1]">Pharmacist Dashboard</h1>
        <p className="text-[13px] text-[--text-3]">Welcome, {session?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Pending Prescriptions" value={pendingRx.length.toString()} color="warning" />
        <StatCard icon={CheckCircle} label="Dispensed Today" value={dispensedToday.length.toString()} color="success" />
        <StatCard icon={TrendingDown} label="Low Stock Items" value={lowStock.length.toString()} color="danger" />
        <StatCard icon={Pill} label="Total Drugs" value={totalDrugs.toString()} color="accent" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Pending Prescriptions */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Pending Prescriptions</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : pendingRx.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No pending prescriptions" description="All prescriptions have been dispensed" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Diagnosis</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Date</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3] w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {pendingRx.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[--surface-2]">
                      <td className="py-2.5 px-3 font-medium text-[--text-1]">{r.diagnosis}</td>
                      <td className="py-2.5 px-3 text-[--text-3]">{r.createdAt ? format(new Date(r.createdAt), 'dd MMM') : '—'}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-[--warning] font-medium">Awaiting</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Low Stock Alerts</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : lowStock.length === 0 ? (
            <p className="text-[13px] text-[--text-3] text-center py-8">All drugs are well stocked</p>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {lowStock.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[--danger-soft]">
                  <div>
                    <p className="text-[13px] font-medium text-[--text-1]">{d.name}</p>
                    <p className="text-[11px] text-[--danger]">{d.quantity} / {d.reorderLevel} {d.unit}</p>
                  </div>
                  <TrendingDown className="w-4 h-4 text-[--danger]" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
