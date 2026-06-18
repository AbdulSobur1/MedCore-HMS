'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Edit, FileText, User } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppModal } from '@/components/ui/AppModal'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function PatientRecordsPage() {
  const { session } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ phone: '', address: '', emergencyContact: '' })

  useEffect(() => {
    if (!session) return
    fetch(`/api/patients/${session.id}`).then(r => r.ok && r.json()).then(d => {
      setProfile(d.patient)
      setEditForm({ phone: d.patient?.phone || '', address: d.patient?.address || '', emergencyContact: d.patient?.emergencyContact || '' })
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false))
  }, [session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/patients/${session?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        toast.success('Profile updated')
        setShowEdit(false)
        setProfile((prev: any) => ({ ...prev, ...editForm }))
      } else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-[--surface-2] rounded animate-pulse" />)}</div>
  if (!profile) return <EmptyState icon={User} title="Profile not found" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">My Records</h1></div>
        <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 border border-[--border] rounded-lg text-[13px] hover:bg-[--surface-2]">
          <Edit className="w-4 h-4" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Personal Information</h3>
          <Row label="Patient Code" value={profile.patientCode} />
          <Row label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
          <Row label="Date of Birth" value={profile.dob || '—'} />
          <Row label="Gender" value={profile.gender} />
          <Row label="Blood Type" value={profile.bloodType || '—'} />
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Contact Information</h3>
          <Row label="Email" value={profile.email} />
          <Row label="Phone" value={profile.phone} />
          <Row label="Address" value={profile.address || '—'} />
          <Row label="Emergency Contact" value={profile.emergencyContact || '—'} />
          <Row label="Insurance / HMO" value={profile.insurance || '—'} />
        </div>
      </div>

      {showEdit && (
        <AppModal title="Edit Profile" onClose={() => setShowEdit(false)} size="md">
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[--text-2] mb-1">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[--text-2] mb-1">Address</label>
                <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[--text-2] mb-1">Emergency Contact</label>
                <input value={editForm.emergencyContact} onChange={e => setEditForm(f => ({ ...f, emergencyContact: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Save Changes</button>
            </form>
        </AppModal>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[11px] text-[--text-3]">{label}</p><p className="text-[13px] font-medium text-[--text-1]">{value}</p></div>
}
