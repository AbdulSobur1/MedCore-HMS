'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Pill } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

const TABS = ['Active', 'Past']

export default function PatientPrescriptionsPage() {
  const { session } = useAuth()
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Active')

  useEffect(() => {
    fetch('/api/prescriptions').then(r => r.ok && r.json()).then(d => {
      setPrescriptions(d.prescriptions || [])
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [session])

  const filtered = tab === 'Active' ? prescriptions.filter((r: any) => r.status === 'pending') : prescriptions.filter((r: any) => r.status === 'dispensed')

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">My Prescriptions</h1></div>

      <div className="flex gap-1 overflow-x-auto border-b border-[--border]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3]'}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-[--surface-2] rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Pill} title={tab === 'Active' ? 'No active prescriptions' : 'No past prescriptions'} />
      ) : (
        <div className="space-y-3">
          {filtered.map((r: any) => (
            <div key={r.id} className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[13px] font-semibold text-[--text-1]">{r.diagnosis}</p>
                  <p className="text-[11px] text-[--text-3]">{r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : '—'}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.drugs?.length > 0 && (
                <div className="border-t border-[--border] pt-3 mt-3 space-y-2">
                  {r.drugs.map((d: any, i: number) => (
                    <div key={i} className="flex items-center gap-2.5 text-[12px]">
                      <Pill className="w-3.5 h-3.5 text-[--accent] shrink-0" />
                      <span className="font-medium text-[--text-1]">{d.drugName}</span>
                      <span className="text-[--text-3]">{d.dosage} · {d.frequency} · {d.duration}</span>
                    </div>
                  ))}
                </div>
              )}
              {r.notes && <p className="text-[11px] text-[--text-3] mt-2">Notes: {r.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
