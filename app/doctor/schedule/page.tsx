'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format, startOfWeek, addDays } from 'date-fns'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DoctorSchedulePage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => { fetchAppts() }, [currentWeek])

  const fetchAppts = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) { const d = await res.json(); setAppointments(d.appointments || []) }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getApptsForDay = (day: Date) => appointments.filter((a: any) => {
    if (!a.scheduledAt) return false
    const d = new Date(a.scheduledAt)
    return d.getDate() === day.getDate() && d.getMonth() === day.getMonth() && d.getFullYear() === day.getFullYear()
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">My Schedule</h1><p className="text-[13px] text-[--text-3]">Weekly appointment view</p></div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentWeek(d => addDays(d, -7))} className="px-3 py-1.5 border border-[--border] rounded-lg text-[13px] hover:bg-[--surface-2]">← Prev</button>
          <button onClick={() => setCurrentWeek(new Date())} className="px-3 py-1.5 bg-[--accent] text-white rounded-lg text-[13px]">Today</button>
          <button onClick={() => setCurrentWeek(d => addDays(d, 7))} className="px-3 py-1.5 border border-[--border] rounded-lg text-[13px] hover:bg-[--surface-2]">Next →</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const dayAppts = getApptsForDay(day)
          const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() && day.getFullYear() === new Date().getFullYear()
          return (
            <div key={i} className={`bg-[--surface] border rounded-xl p-3 min-h-[200px] ${isToday ? 'border-[--accent] ring-1 ring-[--accent]' : 'border-[--border]'}`}>
              <p className={`text-[11px] font-semibold mb-2 ${isToday ? 'text-[--accent]' : 'text-[--text-3]'}`}>
                {DAYS[i]} {format(day, 'd')}
              </p>
              {loading ? (
                <div className="space-y-2">{[...Array(2)].map((_, j) => <div key={j} className="h-8 bg-[--surface-2] rounded animate-pulse" />)}</div>
              ) : dayAppts.length === 0 ? (
                <p className="text-[11px] text-[--text-3]">—</p>
              ) : (
                <div className="space-y-1.5">
                  {dayAppts.map((a: any) => (
                    <div key={a.id} className="p-2 rounded-lg bg-[--accent-soft]">
                      <p className="text-[11px] font-medium text-[--accent]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'hh:mm a') : '—'}</p>
                      <p className="text-[10px] text-[--text-2] truncate">{a.patientName || a.patientLastName || '—'}</p>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
