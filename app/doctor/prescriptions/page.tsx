'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Search, FileText } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

const TABS = ['All', 'Pending', 'Dispensed']

export default function DoctorPrescriptionsPage() {
  const { session } = useAuth()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/prescriptions').then(r => r.ok && r.json()).then(d => {
      setPrescriptions(d.prescriptions || [])
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }, [session])

  const filtered = prescriptions.filter((r: any) => {
    const matchesTab = tab === 'All' || r.status === tab.toLowerCase()
    const matchesSearch = r.diagnosis?.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">Prescriptions</h1><p className="text-[13px] text-[--text-3]">View all prescriptions you've created</p></div>

      <div className="flex gap-1 border-b border-[--border]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3]'}`}>{t}</button>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search by diagnosis..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Diagnosis</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden lg:table-cell">Drugs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(4)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : filtered.length === 0 ? <tr><td colSpan={4}><EmptyState icon={FileText} title="No prescriptions found" /></td></tr>
              : filtered.map((r: any) => (
                  <tr key={r.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 font-medium text-[--text-1]">{r.diagnosis}</td>
                    <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : '—'}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden lg:table-cell">
                      {r.drugs?.length ? r.drugs.map((d: any) => d.drugName).join(', ') : '—'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
