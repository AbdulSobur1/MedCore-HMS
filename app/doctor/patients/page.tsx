'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Search, Users } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function DoctorPatientsPage() {
  const { session } = useAuth()
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/patients').then(r => r.ok && r.json()).then(d => {
      setPatients(d.patients || [])
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }, [session])

  const filtered = patients.filter((p: any) =>
    `${p.firstName} ${p.lastName} ${p.patientCode}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">My Patients</h1><p className="text-[13px] text-[--text-3]">Patients assigned to you</p></div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Patient</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Blood Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(5)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : filtered.length === 0 ? <tr><td colSpan={5}><EmptyState icon={Users} title="No patients found" /></td></tr>
              : filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 font-medium text-[--text-1]">{p.firstName} {p.lastName}</td>
                    <td className="py-3 px-4 font-mono text-[12px] text-[--accent]">{p.patientCode}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{p.bloodType || '—'}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{p.createdAt ? format(new Date(p.createdAt), 'dd MMM yyyy') : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
