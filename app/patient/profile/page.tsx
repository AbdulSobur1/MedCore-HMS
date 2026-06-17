'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Edit, User, Lock, Mail } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { toast } from 'sonner'

export default function PatientProfilePage() {
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
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) { toast.success('Profile updated'); setShowEdit(false); setProfile((p: any) => ({ ...p, ...editForm })) }
      else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-[--surface-2] rounded animate-pulse" />)}</div>
  if (!profile) return <EmptyState icon={User} title="Profile not found" />

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Profile</h1></div>
        <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 border border-[--border] rounded-lg text-[13px] hover:bg-[--surface-2]">
          <Edit className="w-4 h-4" /> Edit
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[--surface] border border-[--border] rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-bold text-xl">
          {`${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[--text-1]">{profile.firstName} {profile.lastName}</h2>
          <p className="text-[13px] text-[--text-3]">{profile.patientCode}</p>
          <p className="text-[13px] text-[--text-2]">{profile.email}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-3">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Personal Info</h3>
          <InfoRow label="DOB" value={profile.dob} />
          <InfoRow label="Gender" value={profile.gender} />
          <InfoRow label="Blood Type" value={profile.bloodType || '—'} />
          <InfoRow label="Insurance" value={profile.insurance || '—'} />
        </div>
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-3">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Contact</h3>
          <InfoRow label="Phone" value={profile.phone} />
          <InfoRow label="Address" value={profile.address || '—'} />
          <InfoRow label="Emergency" value={profile.emergencyContact || '—'} />
        </div>
      </div>

      {/* Security */}
      <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
        <h3 className="text-[13px] font-semibold text-[--text-1] mb-3">Security</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 text-[13px]">
            <Mail className="w-4 h-4 text-[--text-3]" />
            <span className="text-[--text-2]">Email: {profile.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-[13px]">
            <Lock className="w-4 h-4 text-[--text-3]" />
            <span className="text-[--text-2]">Login method: Password</span>
          </div>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowEdit(false)} />
          <div className="relative bg-[--surface] rounded-xl border border-[--border] p-6 w-full max-w-md">
            <h2 className="text-[15px] font-semibold text-[--text-1] mb-4">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-[11px] font-medium text-[--text-2] mb-1">Phone</label>
                <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" /></div>
              <div><label className="block text-[11px] font-medium text-[--text-2] mb-1">Address</label>
                <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" /></div>
              <div><label className="block text-[11px] font-medium text-[--text-2] mb-1">Emergency Contact</label>
                <input value={editForm.emergencyContact} onChange={e => setEditForm(f => ({ ...f, emergencyContact: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" /></div>
              <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-[11px] text-[--text-3]">{label}</span><span className="text-[13px] font-medium text-[--text-1]">{value}</span></div>
}
