'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Download, DollarSign } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

export function BillingSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patientId: '', patientName: '', services: '', amount: 0, dueDate: '' })

  useEffect(() => { fetchInvoices() }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) { const d = await res.json(); setInvoices(d.invoices || []) }
    } catch { toast.error('Failed to load invoices') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          services: form.services.split(',').map((s: string) => s.trim()),
          date: new Date().toISOString().split('T')[0],
        }),
      })
      if (res.ok) {
        toast.success('Invoice created')
        setShowNew(false)
        setForm({ patientId: '', patientName: '', services: '', amount: 0, dueDate: '' })
        fetchInvoices()
      } else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to create invoice') }
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = (inv.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalRevenue = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + (i.amount || 0), 0)
  const pendingAmount = invoices.filter((i) => i.status === 'Pending').reduce((s, i) => s + (i.amount || 0), 0)
  const overdueAmount = invoices.filter((i) => i.status === 'Overdue').reduce((s, i) => s + (i.amount || 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing & Payments</h1>
          <p className="text-muted-foreground mt-2">Manage invoices and financial records</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-success">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-2">From paid invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-success/20"><DollarSign className="w-6 h-6 text-success" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payment</p>
              <p className="text-3xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
              <p className="text-xs text-muted-foreground mt-2">{invoices.filter(i => i.status === 'Pending').length} invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/20"><DollarSign className="w-6 h-6 text-warning" /></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue Payment</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(overdueAmount)}</p>
              <p className="text-xs text-muted-foreground mt-2">{invoices.filter(i => i.status === 'Overdue').length} invoices</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/20"><DollarSign className="w-6 h-6 text-destructive" /></div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by patient name or invoice ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-2">
          {['All', 'Paid', 'Pending', 'Overdue'].map((s) => (
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
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Invoice ID</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Patient</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Amount</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Date</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Due Date</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                    ))}
                  </tr>
                ))
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-4 px-6 text-foreground text-sm font-medium">{inv.id}</td>
                  <td className="py-4 px-6 text-foreground text-sm">{inv.patientName || inv.patientId}</td>
                  <td className="py-4 px-6 text-foreground text-sm font-semibold">{formatCurrency(inv.amount || 0)}</td>
                  <td className="py-4 px-6 text-muted-foreground text-sm">{inv.date}</td>
                  <td className="py-4 px-6 text-muted-foreground text-sm">{inv.dueDate}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      inv.status === 'Paid' ? 'bg-success/20 text-success' :
                      inv.status === 'Pending' ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => toast.info('Invoice PDF generation coming soon')} className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <Download className="w-4 h-4 text-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Patient ID" value={form.patientId} onChange={(e) => setForm(f => ({ ...f, patientId: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input placeholder="Patient Name" value={form.patientName} onChange={(e) => setForm(f => ({ ...f, patientName: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <textarea placeholder="Services (comma separated)" value={form.services} onChange={(e) => setForm(f => ({ ...f, services: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" rows={3} />
            <input type="number" placeholder="Amount" value={form.amount || ''} onChange={(e) => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <input type="date" placeholder="Due Date" value={form.dueDate} onChange={(e) => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <button type="submit" className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90">Create Invoice</button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
