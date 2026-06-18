'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

const TABS = ['All', 'Today', 'Pending', 'Confirmed', 'Cancelled']

export default function ReceptionistAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ patientId: '', doctorId: '', type: 'Consultation', department: '', scheduledAt: '', notes: '' })

  useEffect(() => { fetchAppts() }, [])

  const fetchAppts = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) { const d = await res.json(); setAppointments(d.appointments || []) }
    } catch { toast.error('Failed to load appointments') }
    finally { setLoading(false) }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
      })
      if (res.ok) { toast.success('Appointment created'); setShowNew(false); fetchAppts() }
      else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to create') }
  }

  const handleCheckIn = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' }),
      })
      if (res.ok) { toast.success('Patient checked in'); fetchAppts() }
      else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (res.ok) { toast.success('Appointment cancelled'); fetchAppts() }
      else { toast.error('Failed to cancel') }
    } catch { toast.error('Failed to cancel') }
  }

  const filtered = activeTab === 'All' ? appointments
    : activeTab === 'Today' ? appointments.filter((a: any) => {
        const d = new Date(a.scheduledAt); const t = new Date()
        return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
      })
    : appointments.filter((a: any) => a.status === activeTab.toLowerCase())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Appointments</h1><p className="text-[13px] text-[--text-3]">Manage patient appointments</p></div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover] transition-colors">
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <div className="flex gap-1 border-b border-[--border]">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === tab ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3] hover:text-[--text-1]'
            }`}>{tab}</button>
        ))}
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Date & Time</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Patient</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Doctor</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Calendar} title="No appointments found" /></td></tr>
              ) : (
                filtered.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[--surface-2] transition-colors">
                    <td className="py-3 px-4 text-[--text-1]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'dd MMM hh:mm a') : '—'}</td>
                    <td className="py-3 px-4 font-medium text-[--text-1]">{a.patientName || a.patientLastName || 'Unknown'}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{a.doctorName || '—'}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{a.type}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {a.status === 'pending' && (
                          <>
                            <button onClick={() => handleCheckIn(a.id)} className="px-2.5 py-1.5 bg-[--accent] text-white rounded-lg text-[11px] font-medium hover:bg-[--accent-hover]">Check In</button>
                            <button onClick={() => handleCancel(a.id)} className="px-2.5 py-1.5 bg-[--danger-soft] text-[--danger] rounded-lg text-[11px] font-medium hover:bg-[--danger] hover:text-white">Cancel</button>
                          </>
                        )}
                        {a.status === 'confirmed' && <span className="text-[11px] text-[--success] font-medium px-2">Checked In</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 lg:left-[220px] bg-black/30" onClick={() => setShowNew(false)} />
          <div className="relative bg-[--surface] rounded-xl border border-[--border] p-6 w-full max-w-lg">
            <h2 className="text-[15px] font-semibold text-[--text-1] mb-4">Book Appointment</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input placeholder="Patient ID" value={form.patientId} onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <input placeholder="Doctor ID" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]">
                  <option>Consultation</option><option>Follow-up</option><option>Checkup</option><option>Emergency</option>
                </select>
              </div>
              <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" rows={2} />
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Create Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
