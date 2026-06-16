'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function AppointmentsSection() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [showDetails, setShowDetails] = useState<any | null>(null)
  const [form, setForm] = useState({ patientId: '', doctor: '', department: '', date: '', time: '', room: '', type: 'Consultation' })

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments?date=${selectedDate}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments || [])
      }
    } catch {
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, patientName: form.patientId }),
      })
      if (res.ok) {
        toast.success('Appointment created')
        setShowNew(false)
        setForm({ patientId: '', doctor: '', department: '', date: '', time: '', room: '', type: 'Consultation' })
        fetchAppointments()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create')
      }
    } catch {
      toast.error('Failed to create appointment')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage patient appointments</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Select Date</h3>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>

        <div className="lg:col-span-3">
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))
            ) : appointments.length > 0 ? (
              appointments.map((apt) => (
                <div key={apt.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{apt.patientName || apt.patientId}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{apt.type}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'Completed' ? 'bg-success/20 text-success' :
                      apt.status === 'Confirmed' ? 'bg-info/20 text-info' :
                      apt.status === 'Pending' ? 'bg-warning/20 text-warning' :
                      'bg-accent/20 text-accent'
                    }`}>{apt.status || 'Scheduled'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" /><span>{apt.doctor}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /><span>{apt.time}</span></div>
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4" /><span>Room {apt.room}</span></div>
                    <div className="text-muted-foreground">{apt.department}</div>
                  </div>
                  <button onClick={() => setShowDetails(apt)} className="w-full mt-4 px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">View Details</button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12"><p className="text-muted-foreground">No appointments for this date</p></div>
            )}
          </div>
        </div>
      </div>

      {/* New Appointment Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Appointment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <input placeholder="Patient ID" value={form.patientId} onChange={(e) => setForm(f => ({ ...f, patientId: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input placeholder="Doctor Name" value={form.doctor} onChange={(e) => setForm(f => ({ ...f, doctor: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input placeholder="Department" value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
              <input type="time" value={form.time} onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            </div>
            <input placeholder="Room" value={form.room} onChange={(e) => setForm(f => ({ ...f, room: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <button type="submit" className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90">Create Appointment</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!showDetails} onOpenChange={(o) => { if (!o) setShowDetails(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Appointment Details</DialogTitle></DialogHeader>
          {showDetails && (
            <div className="space-y-3">
              {Object.entries(showDetails).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm font-medium text-foreground">{String(val || '—')}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
