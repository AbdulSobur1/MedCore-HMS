'use client'

import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import { StatCard } from './stat-card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const chartData = [
  { name: 'Mon', patients: 45, appointments: 32 },
  { name: 'Tue', patients: 52, appointments: 38 },
  { name: 'Wed', patients: 48, appointments: 35 },
  { name: 'Thu', patients: 61, appointments: 42 },
  { name: 'Fri', patients: 55, appointments: 39 },
  { name: 'Sat', patients: 38, appointments: 28 },
  { name: 'Sun', patients: 30, appointments: 22 },
]

const recentPatients = [
  { id: 1, name: 'John Doe', condition: 'Hypertension', status: 'Stable', lastVisit: '2 days ago' },
  { id: 2, name: 'Jane Smith', condition: 'Diabetes', status: 'Monitoring', lastVisit: '1 week ago' },
  { id: 3, name: 'Mike Johnson', condition: 'Cardiac', status: 'Critical', lastVisit: 'Today' },
  { id: 4, name: 'Sarah Wilson', condition: 'Respiratory', status: 'Improving', lastVisit: '3 days ago' },
]

export function DashboardSection() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-foreground">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <StatCard title="Total Patients" value="2,847" change="+12% from last month" icon={Users} color="teal" />
        <StatCard
          title="Appointments Today"
          value="24"
          change="8 completed"
          icon={Calendar}
          color="emerald"
        />
        <StatCard title="Active Cases" value="156" change="+5 since yesterday" icon={Activity} color="rose" />
        <StatCard title="Hospital Occupancy" value="78%" change="High capacity" icon={TrendingUp} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Line Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
              <Line type="monotone" dataKey="patients" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="appointments" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'Cardiology', value: 85 },
              { name: 'Orthopedics', value: 72 },
              { name: 'Neurology', value: 68 },
              { name: 'Pediatrics', value: 95 },
              { name: 'General', value: 78 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--card-foreground)' }} />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-4">Recent Patient Visits</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Patient</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden sm:table-cell">Condition</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-muted-foreground hidden md:table-cell">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-border hover:bg-muted transition-colors">
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-foreground">
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{patient.condition}</p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-foreground hidden sm:table-cell">{patient.condition}</td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4">
                    <span
                      className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'Critical'
                          ? 'bg-destructive/20 text-destructive'
                          : patient.status === 'Stable'
                            ? 'bg-success/20 text-success'
                            : patient.status === 'Monitoring'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-info/20 text-info'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-muted-foreground hidden md:table-cell">{patient.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
