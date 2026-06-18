'use client'

import { useState, useEffect } from 'react'
import { CreditCard, TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { toast } from 'sonner'
import { format } from 'date-fns'

function f(n: number) { return '₦' + n.toLocaleString('en-NG', { minimumFractionDigits: 0 }) }

const COLORS = ['#0D7A6B', '#175CD3', '#B54708', '#B42318']

export default function AccountantReportsPage() {
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
  const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.amount), 0)
  const paidCount = invoices.filter((i: any) => i.status === 'paid').length

  // Group by service for service breakdown
  const serviceMap = new Map<string, number>()
  invoices.forEach((inv: any) => {
    const key = inv.service || 'Other'
    serviceMap.set(key, (serviceMap.get(key) || 0) + Number(inv.amount))
  })
  const serviceData = Array.from(serviceMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Monthly revenue build from real invoice dates
  const monthlyMap = new Map<string, number>()
  invoices.filter((i: any) => i.status === 'paid').forEach((inv: any) => {
    if (inv.createdAt) {
      const monthKey = format(new Date(inv.createdAt), 'MMM')
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + Number(inv.amount))
    }
  })
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, revenue]) => ({ month, revenue }))

  const pieData = [
    { name: 'Paid', value: paidCount },
    { name: 'Pending', value: invoices.filter((i: any) => i.status === 'pending').length },
    { name: 'Overdue', value: invoices.filter((i: any) => i.status === 'overdue').length },
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">Financial Reports</h1><p className="text-[13px] text-[--text-3]">Revenue analytics and breakdown</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[--success-soft] flex items-center justify-center"><DollarSign className="w-4 h-4 text-[--success]" /></div>
          </div>
          <p className="text-[11px] text-[--text-3]">Total Revenue</p>
          <p className="text-xl font-bold text-[--text-1]">{f(revenue)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[--info-soft] flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[--info]" /></div>
          </div>
          <p className="text-[11px] text-[--text-3]">Total Invoiced</p>
          <p className="text-xl font-bold text-[--text-1]">{f(totalInvoiced)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[--warning-soft] flex items-center justify-center"><TrendingDown className="w-4 h-4 text-[--warning]" /></div>
          </div>
          <p className="text-[11px] text-[--text-3]">Outstanding</p>
          <p className="text-xl font-bold text-[--text-1]">{f(outstanding)}</p>
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[--danger-soft] flex items-center justify-center"><FileText className="w-4 h-4 text-[--danger]" /></div>
          </div>
          <p className="text-[11px] text-[--text-3]">Overdue</p>
          <p className="text-xl font-bold text-[--text-1]">{f(overdue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Revenue by Month</h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-[13px] text-[--text-3]">No paid invoices yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} formatter={(val: number) => [f(val), 'Revenue']} />
                <Bar dataKey="revenue" fill="#0D7A6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service Breakdown */}
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Revenue by Service</h3>
          {serviceData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-[13px] text-[--text-3]">No invoice data yet</div>
          ) : (
            <div className="space-y-3">
              {serviceData.map((s, i) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="text-[--text-1] font-medium">{s.name}</span>
                    <span className="text-[--text-2]">{f(s.value)}</span>
                  </div>
                  <div className="w-full bg-[--surface-2] rounded-full h-2 overflow-hidden">
                    <div className="h-full rounded-full" style={{
                      width: `${(s.value / serviceData[0].value) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoice Status Pie */}
        {pieData.length > 0 && (
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Invoice Status Breakdown</h3>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-[12px]">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[--text-2]">{d.name}: <strong className="text-[--text-1]">{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
