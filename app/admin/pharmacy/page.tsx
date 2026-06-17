'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, TrendingDown } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pill } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminPharmacyPage() {
  const [tab, setTab] = useState<'prescriptions' | 'inventory'>('prescriptions')
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [drugs, setDrugs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showDrug, setShowDrug] = useState(false)
  const [drugForm, setDrugForm] = useState({ name: '', quantity: 0, unit: 'tablets', reorderLevel: 50 })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rxRes, drugRes] = await Promise.all([fetch('/api/prescriptions'), fetch('/api/drugs')])
      if (rxRes.ok) { const d = await rxRes.json(); setPrescriptions(d.prescriptions || []) }
      if (drugRes.ok) { const d = await drugRes.json(); setDrugs(d.drugs || []) }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleDispense = async (id: string) => {
    try {
      const res = await fetch(`/api/prescriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dispensed' }),
      })
      if (res.ok) { toast.success('Prescription dispensed'); fetchAll() }
      else { toast.error('Failed to dispense') }
    } catch { toast.error('Failed to dispense') }
  }

  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(drugForm),
      })
      if (res.ok) { toast.success('Drug added'); setShowDrug(false); setDrugForm({ name: '', quantity: 0, unit: 'tablets', reorderLevel: 50 }); fetchAll() }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to add drug') }
  }

  const filteredRx = prescriptions.filter((r: any) => r.diagnosis?.toLowerCase().includes(search.toLowerCase()))
  const filteredDrugs = drugs.filter((d: any) => d.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Pharmacy</h1><p className="text-[13px] text-[--text-3]">Prescriptions & inventory management</p></div>
        <button onClick={() => setShowDrug(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
          <Plus className="w-4 h-4" /> Add Drug
        </button>
      </div>

      <div className="flex gap-1 border-b border-[--border]">
        <button onClick={() => setTab('prescriptions')} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'prescriptions' ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3]'}`}>Prescriptions</button>
        <button onClick={() => setTab('inventory')} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === 'inventory' ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3]'}`}>Drug Inventory</button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      {tab === 'prescriptions' && (
        <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-[--surface-2]">
                <tr>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Diagnosis</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Date</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--border]">
                {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(4)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
                : filteredRx.length === 0 ? <tr><td colSpan={4}><EmptyState icon={Pill} title="No prescriptions" /></td></tr>
                : filteredRx.map((r: any) => (
                    <tr key={r.id} className="hover:bg-[--surface-2]">
                      <td className="py-3 px-4 text-[--text-1]">{r.diagnosis}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{r.createdAt ? format(new Date(r.createdAt), 'dd MMM yyyy') : '—'}</td>
                      <td className="py-3 px-4">
                        {r.status === 'pending' && <button onClick={() => handleDispense(r.id)} className="px-3 py-1.5 bg-[--accent] text-white rounded-lg text-[11px] font-medium hover:bg-[--accent-hover]">Dispense</button>}
                        {r.status === 'dispensed' && <span className="text-[11px] text-[--success] font-medium">Done</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? [...Array(3)].map((_, i) => <div key={i} className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-3"><div className="h-5 w-32 bg-[--surface-2] rounded animate-pulse" /><div className="h-8 w-20 bg-[--surface-2] rounded animate-pulse" /><div className="h-4 w-full bg-[--surface-2] rounded animate-pulse" /></div>)
          : filteredDrugs.length === 0 ? <div className="col-span-full"><EmptyState icon={Pill} title="No drugs found" /></div>
          : filteredDrugs.map((d: any) => {
              const isLow = d.quantity <= d.reorderLevel
              return (
                <div key={d.id} className="bg-[--surface] border border-[--border] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-[--text-1] text-[13px]">{d.name}</h3>
                    {isLow && <TrendingDown className="w-4 h-4 text-[--danger]" />}
                  </div>
                  <p className="text-2xl font-bold text-[--text-1]">{d.quantity} <span className="text-sm text-[--text-3]">{d.unit}</span></p>
                  <div className="mt-3 w-full bg-[--surface-2] rounded-full h-2 overflow-hidden">
                    <div className={`h-full rounded-full ${isLow ? 'bg-[--danger]' : 'bg-[--success]'}`}
                      style={{ width: `${Math.min((d.quantity / (d.reorderLevel * 2)) * 100, 100)}%` }} />
                  </div>
                  <p className="text-[11px] text-[--text-3] mt-2">Reorder at: {d.reorderLevel} {d.unit}</p>
                </div>
              )
            })}
        </div>
      )}

      {showDrug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowDrug(false)} />
          <div className="relative bg-[--surface] rounded-xl border border-[--border] p-6 w-full max-w-md">
            <h2 className="text-[15px] font-semibold text-[--text-1] mb-4">Add Drug</h2>
            <form onSubmit={handleAddDrug} className="space-y-3">
              <input placeholder="Drug Name *" value={drugForm.name} onChange={e => setDrugForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Qty" value={drugForm.quantity || ''} onChange={e => setDrugForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
                <select value={drugForm.unit} onChange={e => setDrugForm(f => ({ ...f, unit: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]">
                  <option>tablets</option><option>capsules</option><option>vials</option><option>inhalers</option><option>units</option>
                </select>
                <input type="number" placeholder="Reorder" value={drugForm.reorderLevel} onChange={e => setDrugForm(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Add Drug</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
