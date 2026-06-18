'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AdminChartsProps {
  weeklyData: { day: string; registered: number; discharged: number }[]
  departmentData: { name: string; count: number }[]
}

export function AdminCharts({ weeklyData, departmentData }: AdminChartsProps) {
  const noData = weeklyData.length === 0 || weeklyData.every(d => d.registered === 0 && d.discharged === 0)
  const noDeptData = departmentData.length === 0 || departmentData.every(d => d.count === 0)

  if (noData && noDeptData) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5 flex items-center justify-center h-[260px]">
          <p className="text-[13px] text-[--text-3]">No patient activity available yet</p>
        </div>
        <div className="bg-[--surface] rounded-xl border border-[--border] p-5 flex items-center justify-center h-[260px]">
          <p className="text-[13px] text-[--text-3]">No department data available yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly Patient Activity */}
      <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Weekly Patient Activity</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData} margin={{ bottom: 5, left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="registered" name="Registered" stroke="#0D7A6B" strokeWidth={2} dot={{ r: 3, fill: '#0D7A6B' }} />
            <Line type="monotone" dataKey="discharged" name="Discharged" stroke="#175CD3" strokeWidth={2} dot={{ r: 3, fill: '#175CD3' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department Load */}
      <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Department Load</h3>
        <div className="overflow-visible">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={departmentData} margin={{ bottom: 30, left: 0, right: 10 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#0D7A6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
