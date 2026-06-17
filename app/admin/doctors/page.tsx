'use client'

import { useState, useEffect } from 'react'
import { Stethoscope } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/doctors').then(r => r.ok && r.json()).then(d => { setDoctors(d.doctors || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const roster = [
    { day: 'Monday', shift: 'Dr. Amina Bello', time: '08:00 - 16:00' },
    { day: 'Tuesday', shift: 'Dr. Amina Bello', time: '08:00 - 16:00' },
    { day: 'Wednesday', shift: 'Dr. Amina Bello', time: '10:00 - 18:00' },
    { day: 'Thursday', shift: 'Dr. Amina Bello', time: '08:00 - 16:00' },
    { day: 'Friday', shift: 'Dr. Amina Bello', time: '08:00 - 14:00' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">Doctors</h1><p className="text-[13px] text-[--text-3]">Medical staff directory</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-3"><div className="h-10 w-10 bg-[--surface-2] rounded-lg animate-pulse" /><div className="h-5 w-32 bg-[--surface-2] rounded animate-pulse" /><div className="h-4 w-24 bg-[--surface-2] rounded animate-pulse" /></div>)
        ) : doctors.length === 0 ? (
          <div className="col-span-full"><EmptyState icon={Stethoscope} title="No doctors found" /></div>
        ) : (
          doctors.map((d: any) => (
            <div key={d.id} className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[--accent-soft] flex items-center justify-center text-[--accent] font-bold text-sm">
                  {d.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[--text-1]">{d.name}</p>
                  <p className="text-[11px] text-[--accent]">{d.department}</p>
                </div>
                <div className="ml-auto"><StatusBadge status={d.isActive ? 'active' : 'discharged'} /></div>
              </div>
              <p className="text-[12px] text-[--text-3]">{d.email}</p>
              <p className="text-[12px] text-[--text-3]">{d.phone || '—'}</p>
            </div>
          ))
        )}
      </div>

      {/* Weekly Roster */}
      <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-3">Weekly Roster</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-[--border]">
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase text-[--text-3]">Day</th>
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase text-[--text-3]">Doctor</th>
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase text-[--text-3]">Time</th>
            </tr></thead>
            <tbody className="divide-y divide-[--border]">
              {roster.map((r, i) => (
                <tr key={i} className="hover:bg-[--surface-2]">
                  <td className="py-2.5 px-3 text-[--text-1] font-medium">{r.day}</td>
                  <td className="py-2.5 px-3 text-[--text-2]">{r.shift}</td>
                  <td className="py-2.5 px-3 text-[--text-2]">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
