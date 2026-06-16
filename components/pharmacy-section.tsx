'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, TrendingDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function PharmacySection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory'>('prescriptions')
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewRx, setShowNewRx] = useState(false)
  const [showReorder, setShowReorder] = useState<any | null>(null)
  const [reorderQty, setReorderQty] = useState(0)
  const [newRx, setNewRx] = useState({ patientId: '', medication: '', dosage: '', quantity: 30, prescribedBy: '' })

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [rxRes, invRes] = await Promise.all([
        fetch('/api/prescriptions'),
        fetch('/api/inventory'),
      ])
      if (rxRes.ok) { const d = await rxRes.json(); setPrescriptions(d.prescriptions || []) }
      if (invRes.ok) { const d = await invRes.json(); setInventory(d.inventory || []) }
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const handleNewRx = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRx),
      })
      if (res.ok) {
        toast.success('Prescription created')
        setShowNewRx(false)
        setNewRx({ patientId: '', medication: '', dosage: '', quantity: 30, prescribedBy: '' })
        fetchAll()
      } else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to create prescription') }
  }

  const handleReorder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showReorder) return
    try {
      const res = await fetch(`/api/inventory/${encodeURIComponent(showReorder.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: reorderQty }),
      })
      if (res.ok) {
        toast.success(`Stock updated for ${showReorder.name}`)
        setShowReorder(null)
        fetchAll()
      } else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to update stock') }
  }

  const filteredRx = prescriptions.filter((rx) => {
    const matchesSearch = (rx.patientName || rx.patientId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rx.medication || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || rx.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const filteredInv = inventory.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      Dispensed: 'bg-success/20 text-success',
      Ready: 'bg-info/20 text-info',
      Pending: 'bg-warning/20 text-warning',
    }
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pharmacy Management</h1>
          <p className="text-muted-foreground mt-2">Manage prescriptions and inventory</p>
        </div>
        <button onClick={() => setShowNewRx(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> New Prescription
        </button>
      </div>

      <div className="flex gap-4 border-b border-border">
        {(['prescriptions', 'inventory'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === tab ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab === 'prescriptions' ? 'Prescriptions' : 'Inventory'}
          </button>
        ))}
      </div>

      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search by patient or medication..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="flex gap-2">
              {['All', 'Pending', 'Ready', 'Dispensed'].map((s) => (
                <button key={s} onClick={() => setSelectedStatus(s)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedStatus === s ? 'bg-accent text-accent-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Patient</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Medication</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Dosage</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {[...Array(6)].map((__, j) => (
                          <td key={j} className="py-4 px-6"><Skeleton className="h-4 w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredRx.map((rx) => (
                    <tr key={rx.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{rx.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.patientName || rx.patientId}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.medication}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{rx.dosage}</td>
                      <td className="py-4 px-6"><StatusBadge status={rx.status} /></td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{rx.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search medications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : filteredInv.map((item, idx) => {
              const isLowStock = item.stock <= item.minStock
              return (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    {isLowStock && <TrendingDown className="w-5 h-5 text-destructive" />}
                  </div>
                  <div className="space-y-3">
                    <div><p className="text-xs text-muted-foreground mb-1">Current Stock</p>
                      <p className="text-2xl font-bold text-foreground">{item.stock} <span className="text-sm text-muted-foreground">{item.unit}</span></p></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Min Stock</p><p className="text-sm text-foreground">{item.minStock} {item.unit}</p></div>
                    <div><p className="text-xs text-muted-foreground mb-1">Supplier</p><p className="text-sm text-foreground">{item.supplier}</p></div>
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className={`h-full ${isLowStock ? 'bg-destructive' : 'bg-success'}`}
                          style={{ width: `${Math.min((item.stock / (item.minStock * 2)) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <button onClick={() => { setShowReorder(item); setReorderQty(item.stock) }}
                      className="w-full mt-4 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">Reorder</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Dialog open={showNewRx} onOpenChange={setShowNewRx}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Prescription</DialogTitle></DialogHeader>
          <form onSubmit={handleNewRx} className="space-y-4">
            <input placeholder="Patient ID" value={newRx.patientId} onChange={(e) => setNewRx(r => ({ ...r, patientId: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input placeholder="Medication" value={newRx.medication} onChange={(e) => setNewRx(r => ({ ...r, medication: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input placeholder="Dosage (e.g. Once daily)" value={newRx.dosage} onChange={(e) => setNewRx(r => ({ ...r, dosage: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <input type="number" placeholder="Quantity" value={newRx.quantity} onChange={(e) => setNewRx(r => ({ ...r, quantity: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <input placeholder="Prescribed By" value={newRx.prescribedBy} onChange={(e) => setNewRx(r => ({ ...r, prescribedBy: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <button type="submit" className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90">Create Prescription</button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showReorder} onOpenChange={(o) => { if (!o) setShowReorder(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reorder Stock</DialogTitle></DialogHeader>
          {showReorder && (
            <form onSubmit={handleReorder} className="space-y-4">
              <p className="text-sm text-foreground">{showReorder.name}</p>
              <input type="number" placeholder="New stock quantity" value={reorderQty} onChange={(e) => setReorderQty(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
              <button type="submit" className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90">Update Stock</button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
