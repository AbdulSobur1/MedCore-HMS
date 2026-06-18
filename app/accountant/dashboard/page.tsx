'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { CreditCard, TrendingUp, AlertCircle, DollarSign } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

function f(n: number) { return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 }) }

export default function AccountantDashboardPage() {
  const { session } = useAuth()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices').then(r => r.ok ? r.json() : { invoices: [] }).then(d => {
      setInvoices(d.invoices || [])
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }, [])

  const revenue = invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const outstanding = invoices.filter((i: any) => i.status === 'pending').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const overdue = invoices.filter((i: any) => i.status === 'overdue').reduce((s: number, i: any) => s + Number(i.amount), 0)
  const pendingCount = invoices.filter((i: any) => i.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[--text-1]">Accountant Dashboard</h1>
        <p className="text-[13px] text-[--text-3]">Welcome, {session?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={f(revenue)} color="success" />
        <StatCard icon={TrendingUp} label="Outstanding" value={f(outstanding)} color="warning" />
        <StatCard icon={AlertCircle} label="Overdue" value={f(overdue)} color="danger" />
        <StatCard icon={CreditCard} label="Pending Invoices" value={pendingCount.toString()} color="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Recent Invoices */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Recent Invoices</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : invoices.length === 0 ? (
            <EmptyState icon={CreditCard} title="No invoices yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[--border]">
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Invoice</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Service</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Amount</th>
                    <th className="text-left py-2.5 px-3 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[--border]">
                  {invoices.slice(0, 8).map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-[--surface-2]">
                      <td className="py-2.5 px-3 font-mono text-[12px] text-[--accent]">{inv.invoiceCode}</td>
                      <td className="py-2.5 px-3 text-[--text-1]">{inv.service}</td>
                      <td className="py-2.5 px-3 font-semibold text-[--text-1]">{f(Number(inv.amount))}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Payment Summary</h3>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-[--surface-2] rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[--success-soft]">
                <div>
                  <p className="text-[12px] font-medium text-[--success]">Paid</p>
                  <p className="text-[11px] text-[--text-3]">{invoices.filter(i => i.status === 'paid').length} invoices</p>
                </div>
                <p className="text-[15px] font-bold text-[--success]">{f(revenue)}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[--warning-soft]">
                <div>
                  <p className="text-[12px] font-medium text-[--warning]">Pending</p>
                  <p className="text-[11px] text-[--text-3]">{invoices.filter(i => i.status === 'pending').length} invoices</p>
                </div>
                <p className="text-[15px] font-bold text-[--warning]">{f(outstanding)}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[--danger-soft]">
                <div>
                  <p className="text-[12px] font-medium text-[--danger]">Overdue</p>
                  <p className="text-[11px] text-[--text-3]">{invoices.filter(i => i.status === 'overdue').length} invoices</p>
                </div>
                <p className="text-[15px] font-bold text-[--danger]">{f(overdue)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
