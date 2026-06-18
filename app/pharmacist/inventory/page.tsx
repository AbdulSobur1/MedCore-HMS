'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, TrendingDown, Pill } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppModal } from '@/components/ui/AppModal'
import { toast } from 'sonner'

export default function PharmacistInventoryPage() {
  const [drugs, setDrugs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState<any | null>(null)
  const [form, setForm] = useState({ name: '', quantity: 0, unit: 'tablets', reorderLevel: 50 })
  const [editForm, setEditForm] = useState({ quantity: 0, unit: 'tablets', reorderLevel: 50 })

  useEffect(() => { fetchDrugs() }, [])

  const fetchDrugs = async () => {
    try {
      const res = await fetch('/api/drugs')
      if (res.ok) { const d = await res.json(); setDrugs(d.drugs || []) }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/drugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success('Drug added'); setShowAdd(false); setForm({ name: '', quantity: 0, unit: 'tablets', reorderLevel: 50 }); fetchDrugs() }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to add drug') }
  }

  const handleUpdate = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/drugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) { toast.success('Drug updated'); setShowEdit(null); fetchDrugs() }
      else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  const filtered = drugs.filter((d: any) => d.name?.toLowerCase().includes(search.toLowerCase()))

  const lowStock = drugs.filter((d: any) => d.quantity <= d.reorderLevel).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--text-1]">Drug Inventory</h1>
          <p className="text-[13px] text-[--text-3]">{lowStock > 0 ? `${lowStock} item(s) below reorder level` : 'All items well stocked'}</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
          <Plus className="w-4 h-4" /> Add Drug
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search drugs..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-3"><div className="h-5 w-32 bg-[--surface-2] rounded animate-pulse" /><div className="h-8 w-20 bg-[--surface-2] rounded animate-pulse" /><div className="h-4 w-full bg-[--surface-2] rounded animate-pulse" /></div>)
        : filtered.length === 0 ? <div className="col-span-full"><EmptyState icon={Pill} title="No drugs found" description="Add drugs to your inventory" /></div>
        : filtered.map((d: any) => {
            const isLow = d.quantity <= d.reorderLevel
            return (
              <div key={d.id} className="bg-[--surface] border border-[--border] rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-[--text-1] text-[13px]">{d.name}</h3>
                    <p className="text-[11px] text-[--text-3]">Unit: {d.unit}</p>
                  </div>
                  {isLow && <TrendingDown className="w-4 h-4 text-[--danger] shrink-0" />}
                </div>
                <p className="text-2xl font-bold text-[--text-1]">{d.quantity} <span className="text-sm text-[--text-3] font-normal">{d.unit}</span></p>
                <div className="mt-3 w-full bg-[--surface-2] rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isLow ? 'bg-[--danger]' : 'bg-[--success]'}`}
                    style={{ width: `${Math.min((d.quantity / Math.max(d.reorderLevel * 2, 1)) * 100, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[11px] text-[--text-3]">Reorder at: {d.reorderLevel}</p>
                  <button onClick={() => { setShowEdit(d); setEditForm({ quantity: d.quantity, unit: d.unit, reorderLevel: d.reorderLevel }) }}
                    className="text-[11px] text-[--accent] font-medium hover:underline">Update Stock</button>
                </div>
              </div>
            )
          })}
      </div>

      {/* Add Drug Modal */}
      {showAdd && (
        <AppModal title="Add Drug" onClose={() => setShowAdd(false)} size="md">
            <form onSubmit={handleAdd} className="space-y-3">
              <input placeholder="Drug Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="number" placeholder="Qty" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
                <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]">
                  <option>tablets</option><option>capsules</option><option>vials</option><option>inhalers</option><option>units</option>
                </select>
                <input type="number" placeholder="Reorder" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Add Drug</button>
            </form>
        </AppModal>
      )}

      {/* Edit Stock Modal */}
      {showEdit && (
        <AppModal title={`Update Stock - ${showEdit.name}`} onClose={() => setShowEdit(null)} size="md">
            <form onSubmit={(e) => handleUpdate(e, showEdit.id)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="number" placeholder="Qty" value={editForm.quantity || ''} onChange={e => setEditForm(f => ({ ...f, quantity: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
                <select value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]">
                  <option>tablets</option><option>capsules</option><option>vials</option><option>inhalers</option><option>units</option>
                </select>
                <input type="number" placeholder="Reorder" value={editForm.reorderLevel} onChange={e => setEditForm(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Update</button>
            </form>
        </AppModal>
      )}
    </div>
  )
}
