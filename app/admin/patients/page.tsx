'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Eye, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Male', bloodType: '', address: '', emergencyContact: '' })

  useEffect(() => { fetchPatients() }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) { const d = await res.json(); setPatients(d.patients || []) }
    } catch { toast.error('Failed to load patients') }
    finally { setLoading(false) }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      })
      if (res.ok) {
        toast.success('Patient registered')
        setShowNew(false)
        setNewForm({ firstName: '', lastName: '', email: '', phone: '', dob: '', gender: 'Male', bloodType: '', address: '', emergencyContact: '' })
        fetchPatients()
      } else { const d = await res.json(); toast.error(d.error || 'Failed') }
    } catch { toast.error('Failed to add patient') }
  }

  const filtered = patients.filter((p: any) =>
    `${p.firstName} ${p.lastName} ${p.patientCode} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[--text-1]">Patients</h1>
          <p className="text-[13px] text-[--text-3]">Manage all patient records</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover] transition-colors">
          <Plus className="w-4 h-4" /> Register Patient
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
        <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-[--surface] border border-[--border] text-[13px] text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
      </div>

      {/* Table */}
      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3]">Code</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3]">Patient</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3] hidden md:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3] hidden md:table-cell">Date</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking text-[--text-3] w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icon={Users} title="No patients found" description="Register a patient to get started" /></td></tr>
              ) : (
                filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-[--surface-2] transition-colors">
                    <td className="py-3 px-4 font-mono text-[--accent] text-[12px]">{p.patientCode}</td>
                    <td className="py-3 px-4 font-medium text-[--text-1]">{p.firstName} {p.lastName}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{p.email}</td>
                    <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                    <td className="py-3 px-4 text-[--text-3] hidden md:table-cell">{format(new Date(p.createdAt), 'dd MMM yyyy')}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelected(p)} className="p-1.5 rounded-lg hover:bg-[--surface-2] text-[--text-2]">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex lg:left-[220px]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative ml-auto w-[480px] max-w-full bg-[--surface] border-l border-[--border] h-full overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[--border]">
              <h2 className="text-[15px] font-semibold text-[--text-1]">{selected.firstName} {selected.lastName}</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[--surface-2]"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 space-y-5">
              <Section title="Biodata">
                <Row label="Code" value={selected.patientCode} />
                <Row label="Email" value={selected.email} />
                <Row label="Phone" value={selected.phone} />
                <Row label="DOB" value={selected.dob} />
                <Row label="Gender" value={selected.gender} />
                <Row label="Blood Type" value={selected.bloodType || '—'} />
                <Row label="Status" value={<StatusBadge status={selected.status} />} />
              </Section>
            </div>
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:left-[220px]">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowNew(false)} />
          <div className="relative bg-[--surface] rounded-xl border border-[--border] p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-[15px] font-semibold text-[--text-1] mb-4">Register Patient</h2>
            <form onSubmit={handleAddPatient} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="First Name *" value={newForm.firstName} onChange={e => setNewForm(f => ({ ...f, firstName: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <input placeholder="Last Name *" value={newForm.lastName} onChange={e => setNewForm(f => ({ ...f, lastName: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <input placeholder="Email *" type="email" value={newForm.email} onChange={e => setNewForm(f => ({ ...f, email: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <input placeholder="Phone *" value={newForm.phone} onChange={e => setNewForm(f => ({ ...f, phone: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <input type="date" value={newForm.dob} onChange={e => setNewForm(f => ({ ...f, dob: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                <select value={newForm.gender} onChange={e => setNewForm(f => ({ ...f, gender: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]">
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover] transition-colors">
                Register Patient
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking text-[--text-3] mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-[--text-3]">{label}</p>
      <p className="text-[13px] text-[--text-1] font-medium">{value}</p>
    </div>
  )
}
