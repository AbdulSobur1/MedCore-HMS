'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { CreditCard } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

function f(n: number) { return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 }) }

export default function PatientBillingPage() {
  const { session } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices').then(r => r.ok && r.json()).then(d => {
      setInvoices(d.invoices || [])
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [session])

  const totalPaid = invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const totalPending = invoices.filter((i: any) => i.status === 'pending' || i.status === 'overdue').reduce((s: number, i: any) => s + Number(i.amount), 0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">My Bills</h1></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] text-[--text-3] mb-1">Total Paid</p>
          <p className="text-xl font-bold text-[--success]">{f(totalPaid)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] text-[--text-3] mb-1">Outstanding</p>
          <p className="text-xl font-bold text-[--warning]">{f(totalPending)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <p className="text-[11px] text-[--text-3] mb-1">Total Invoices</p>
          <p className="text-xl font-bold text-[--text-1]">{invoices.length}</p>
        </div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(5)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : invoices.length === 0 ? <tr><td colSpan={5}><EmptyState icon={CreditCard} title="No invoices" /></td></tr>
              : invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 font-mono text-[12px] text-[--accent]">{inv.invoiceCode}</td>
                    <td className="py-3 px-4 text-[--text-1]">{inv.service}</td>
                    <td className="py-3 px-4 font-semibold text-[--text-1]">{f(Number(inv.amount))}</td>
                    <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{inv.createdAt ? format(new Date(inv.createdAt), 'dd MMM yyyy') : '—'}</td>
                    <td className="py-3 px-4"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
