'use client'

import { useState } from 'react'
import { Download, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const monthlyPatientData = [
  { month: 'Jan', patients: 320, admitted: 45, discharged: 42 },
  { month: 'Feb', patients: 380, admitted: 52, discharged: 48 },
  { month: 'Mar', patients: 450, admitted: 65, discharged: 61 },
  { month: 'Apr', patients: 520, admitted: 78, discharged: 75 },
  { month: 'May', patients: 580, admitted: 92, discharged: 88 },
  { month: 'Jun', patients: 650, admitted: 105, discharged: 98 },
]

const departmentData = [
  { name: 'Cardiology', value: 285, color: 'var(--chart-2)' },
  { name: 'Orthopedics', value: 215, color: 'var(--chart-1)' },
  { name: 'Neurology', value: 165, color: 'var(--chart-5)' },
  { name: 'Pediatrics', value: 245, color: 'var(--chart-4)' },
  { name: 'General', value: 190, color: 'var(--chart-3)' },
]

const operationsData = [
  { name: 'Week 1', surgeries: 12, emergencies: 8, procedures: 24 },
  { name: 'Week 2', surgeries: 15, emergencies: 6, procedures: 28 },
  { name: 'Week 3', surgeries: 18, emergencies: 10, procedures: 32 },
  { name: 'Week 4', surgeries: 14, emergencies: 7, procedures: 26 },
]

export function ReportsSection() {
  const [dateRange, setDateRange] = useState('month')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Hospital performance metrics and statistics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Patients', value: '2,847', color: 'bg-accent' },
          { label: 'Avg. Wait Time', value: '24 min', color: 'bg-info' },
          { label: 'Patient Satisfaction', value: '4.6/5.0', color: 'bg-success' },
          { label: 'Bed Occupancy', value: '78%', color: 'bg-warning' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Growth */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Patient Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPatientData}>
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

        {/* Department Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Patients by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={departmentData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} dataKey="value">
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Operations Overview */}
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

      {/* Department Stats Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Department Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Department</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Patients</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Staff</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Avg Rating</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {[
                { dept: 'Cardiology', patients: 285, staff: 12, rating: 4.8, util: 92 },
                { dept: 'Orthopedics', patients: 215, staff: 8, rating: 4.6, util: 78 },
                { dept: 'Neurology', patients: 165, staff: 6, rating: 4.7, util: 85 },
                { dept: 'Pediatrics', patients: 245, staff: 10, rating: 4.9, util: 88 },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-4 px-4 text-foreground font-medium">{row.dept}</td>
                  <td className="py-4 px-4 text-foreground">{row.patients}</td>
                  <td className="py-4 px-4 text-foreground">{row.staff}</td>
                  <td className="py-4 px-4 text-foreground">⭐ {row.rating}</td>
                  <td className="py-4 px-4 text-foreground">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div className="h-full bg-success rounded-full" style={{ width: `${row.util}%` }}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
