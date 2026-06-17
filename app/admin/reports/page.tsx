'use client'

import { useState, useEffect } from 'react'
import { BarChart3, FileText, Activity, Bed } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => { setLoading(false) }, [])

  const diagnoses = [
    { name: 'Hypertension', count: 28 },
    { name: 'Malaria', count: 22 },
    { name: 'Diabetes', count: 18 },
    { name: 'Respiratory', count: 15 },
    { name: 'Cardiac', count: 12 },
  ]

  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Apr', revenue: 610000 },
    { month: 'May', revenue: 550000 },
    { month: 'Jun', revenue: 680000 },
  ]

  const kpis = [
    { icon: Activity, label: 'Total Consultations', value: '1,247', color: 'accent' },
    { icon: Bed, label: 'Bed Occupancy', value: '72%', color: 'info' },
    { icon: FileText, label: 'Avg Stay Duration', value: '4.2 days', color: 'warning' },
    { icon: BarChart3, label: 'Patient Satisfaction', value: '4.6/5.0', color: 'success' },
  ]

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-semibold text-[--text-1]">Reports</h1><p className="text-[13px] text-[--text-3]">Hospital performance metrics</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const colorMap: Record<string, string> = { accent: 'bg-[--accent-soft] text-[--accent]', info: 'bg-[--info-soft] text-[--info]', warning: 'bg-[--warning-soft] text-[--warning]', success: 'bg-[--success-soft] text-[--success]' }
          return (
            <div key={i} className="bg-[--surface] border border-[--border] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg ${colorMap[k.color]} flex items-center justify-center`}><k.icon className="w-4 h-4" /></div>
              </div>
              <p className="text-[11px] text-[--text-3]">{k.label}</p>
              <p className="text-xl font-bold text-[--text-1]">{k.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Top Diagnoses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={diagnoses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#0D7A6B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#0D7A6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
