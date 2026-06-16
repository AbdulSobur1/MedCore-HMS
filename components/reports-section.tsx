'use client'

import { useState, useEffect } from 'react'
import { Download, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

export function ReportsSection() {
  const [dateRange, setDateRange] = useState('month')
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [operationsData, setOperationsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [dateRange])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [monthlyRes, deptRes, opsRes] = await Promise.all([
        fetch(`/api/reports/monthly?range=${dateRange}`),
        fetch('/api/reports/departments'),
        fetch('/api/reports/operations'),
      ])
      if (monthlyRes.ok) { const d = await monthlyRes.json(); setMonthlyData(d.data || []) }
      if (deptRes.ok) { const d = await deptRes.json(); setDepartmentData(d.data || []) }
      if (opsRes.ok) { const d = await opsRes.json(); setOperationsData(d.data || []) }
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  const exportCsv = () => {
    if (!monthlyData.length) return
    const headers = 'Month,Patients,Admitted,Discharged'
    const rows = monthlyData.map((r: any) => `"${r.month}",${r.patients},${r.admitted},${r.discharged}`).join('\n')
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `report_${dateRange}.csv`; a.click()
    URL.revokeObjectURL(url)
    toast.success('Report exported')
  }

  const totalPatients = monthlyData.reduce((s: number, r: any) => s + (r.patients || 0), 0)
  const avgWait = '24 min'
  const satisfaction = monthlyData.length ? '4.6/5.0' : '—'
  const occupancy = departmentData.length ? `${Math.round(departmentData.reduce((s: number, d: any) => s + d.value, 0) / departmentData.length)}%` : '—'

  const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Hospital performance metrics and statistics</p>
        </div>
        <div className="flex gap-3">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Download className="w-5 h-5" /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: totalPatients.toLocaleString() },
          { label: 'Avg. Wait Time', value: avgWait },
          { label: 'Patient Satisfaction', value: satisfaction },
          { label: 'Bed Occupancy', value: occupancy },
        ].map((metric, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-foreground">{loading ? '...' : metric.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`bg-card border border-border rounded-lg p-6 ${i === 2 ? 'lg:col-span-2' : ''}`}>
              <Skeleton className="h-5 w-48 mb-4" />
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Patient Growth Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="admitted" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="discharged" stroke="var(--chart-5)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Patients by Department</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} dataKey="value">
                  {departmentData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground mb-4">Operations Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={operationsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
                <Legend />
                <Bar dataKey="surgeries" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="emergencies" fill="var(--chart-3)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="procedures" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
