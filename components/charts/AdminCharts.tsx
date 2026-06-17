'use client'

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AdminChartsProps {
  weeklyData: { day: string; admitted: number; discharged: number }[]
  departmentData: { name: string; count: number }[]
}

export function AdminCharts({ weeklyData, departmentData }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Weekly Admissions */}
      <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Weekly Admissions</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="admitted" stroke="#0D7A6B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="discharged" stroke="#175CD3" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Department Load */}
      <div className="bg-[--surface] rounded-xl border border-[--border] p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Department Load</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={departmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#98A2B3', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="#0D7A6B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
