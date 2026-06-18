'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Plus, Calendar } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'
import { format } from 'date-fns'

const TABS = ['Upcoming', 'Past', 'Cancelled']

export default function PatientAppointmentsPage() {
  const { session } = useAuth()
  const [appts, setAppts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Upcoming')
  const [showBook, setShowBook] = useState(false)
  const [form, setForm] = useState({ doctorId: '', type: 'Consultation', scheduledAt: '', notes: '' })

  useEffect(() => { fetchAppts() }, [session])

  const fetchAppts = async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) { const d = await res.json(); setAppts(d.appointments || []) }
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }),
      })
      if (res.ok) {
        toast.success('Appointment requested. A receptionist will confirm shortly.')
        setShowBook(false)
        setForm({ doctorId: '', type: 'Consultation', scheduledAt: '', notes: '' })
        fetchAppts()
      } else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to book appointment') }
  }

  const filtered = appts.filter((a: any) => {
    if (tab === 'Upcoming') return a.status !== 'cancelled'
    if (tab === 'Past') return a.status === 'confirmed'
    if (tab === 'Cancelled') return a.status === 'cancelled'
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">My Appointments</h1></div>
        <button onClick={() => setShowBook(true)} className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      <div className="flex gap-1 border-b border-[--border]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === t ? 'border-[--accent] text-[--accent]' : 'border-transparent text-[--text-3]'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Date & Time</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Type</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Doctor</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(4)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : filtered.length === 0 ? <tr><td colSpan={4}><EmptyState icon={Calendar} title="No appointments" /></td></tr>
              : filtered.map((a: any) => (
                  <tr key={a.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 text-[--text-1]">{a.scheduledAt ? format(new Date(a.scheduledAt), 'dd MMM yyyy, hh:mm a') : '—'}</td>
                    <td className="py-3 px-4 text-[--text-1]">{a.type}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{a.doctorName || '—'}</td>
                    <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 lg:left-[220px] bg-black/30" onClick={() => setShowBook(false)} />
          <div className="relative bg-[--surface] rounded-xl border border-[--border] p-6 w-full max-w-md">
            <h2 className="text-[15px] font-semibold text-[--text-1] mb-4">Book Appointment</h2>
            <form onSubmit={handleBook} className="space-y-3">
              <input placeholder="Doctor ID" value={form.doctorId} onChange={e => setForm(f => ({ ...f, doctorId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px]">
                  <option>Consultation</option><option>Follow-up</option><option>Checkup</option>
                </select>
              </div>
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" rows={2} />
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Request Appointment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
