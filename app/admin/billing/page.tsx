'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, CreditCard } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppModal } from '@/components/ui/AppModal'
import { toast } from 'sonner'
import { format } from 'date-fns'

function f(n: number) { return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 }) }

export default function AdminBillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patientId: '', service: '', amount: 0, paymentMethod: '' })

  useEffect(() => {
    fetchInvoices()
    fetchPatients()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices')
      if (res.ok) { const d = await res.json(); setInvoices(d.invoices || []) }
    } catch { toast.error('Failed to load invoices') }
    finally { setLoading(false) }
  }

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.patients || [])
      }
    } catch {
      toast.error('Failed to load patients')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { toast.success('Invoice created'); setShowNew(false); fetchInvoices() }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to create invoice') }
  }

  const handleMarkPaid = async (id: string) => {
    if (!window.confirm('Mark this invoice as paid?')) return
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paymentMethod: form.paymentMethod || 'cash' }),
      })
      if (res.ok) { toast.success('Invoice marked as paid'); fetchInvoices() }
      else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  const revenue = invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const outstanding = invoices.filter((i: any) => i.status === 'pending').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const overdue = invoices.filter((i: any) => i.status === 'overdue').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const filtered = invoices.filter((i: any) =>
    i.invoiceCode?.toLowerCase().includes(search.toLowerCase()) ||
    i.service?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Billing</h1><p className="text-[13px] text-[--text-3]">Invoices & payments</p></div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] uppercase text-[--text-3] mb-1">Revenue</p>
          <p className="text-xl font-bold text-[--success]">{f(revenue)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] uppercase text-[--text-3] mb-1">Outstanding</p>
          <p className="text-xl font-bold text-[--warning]">{f(outstanding)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] uppercase text-[--text-3] mb-1">Overdue</p>
          <p className="text-xl font-bold text-[--danger]">{f(overdue)}</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Invoice</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Service</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Amount</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : filtered.length === 0 ? <tr><td colSpan={6}><EmptyState icon={CreditCard} title="No invoices" /></td></tr>
              : filtered.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 font-mono text-[12px] text-[--accent]">{inv.invoiceCode}</td>
                    <td className="py-3 px-4 text-[--text-1]">{inv.service}</td>
                    <td className="py-3 px-4 font-semibold text-[--text-1]">{f(Number(inv.amount))}</td>
                    <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{inv.createdAt ? format(new Date(inv.createdAt), 'dd MMM yyyy') : '—'}</td>
                    <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-4">
                      {inv.status === 'pending' && <button onClick={() => handleMarkPaid(inv.id)} className="px-3 py-1.5 bg-[--accent] text-white rounded-lg text-[11px] font-medium hover:bg-[--accent-hover]">Mark Paid</button>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <AppModal title="New Invoice" onClose={() => setShowNew(false)} size="md">
            <form onSubmit={handleCreate} className="space-y-3">
              <select value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required>
                <option value="">Select patient</option>
                {patients.map((patient: any) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientCode} - {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
              <input placeholder="Service *" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <input type="number" placeholder="Amount (kobo) *" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]" required />
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Create Invoice</button>
            </form>
        </AppModal>
      )}
    </div>
  )
}
