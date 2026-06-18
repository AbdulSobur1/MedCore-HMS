'use client'

import { useState, useEffect } from 'react'
import { Plus, ShieldCheck, Copy, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { AppModal } from '@/components/ui/AppModal'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminUsersPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'doctor', department: '' })

  useEffect(() => {
    fetchStaff()
    fetchInvites()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff')
      if (res.ok) { const d = await res.json(); setStaff(d.staff || []) }
    } catch { toast.error('Failed to load staff') }
    finally { setLoading(false) }
  }

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/staff/invite')
      if (res.ok) {
        const data = await res.json()
        setInvites(data.invites || [])
      }
    } catch {
      toast.error('Failed to load staff invites')
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      })
      const d = await res.json()
      if (res.ok) {
        setInviteUrl(d.inviteUrl)
        fetchInvites()
        toast.success('Invite created! Share the link below.')
      } else {
        toast.error(d.error || 'Failed to create invite')
      }
    } catch { toast.error('Failed to create invite') }
  }

  const copyLink = (url = inviteUrl) => {
    navigator.clipboard.writeText(url)
    toast.success('Link copied!')
  }

  const revokeInvite = async (id: string) => {
    if (!window.confirm('Revoke this staff invite?')) return
    try {
      const res = await fetch(`/api/staff/invite/revoke/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Invite revoked')
        fetchInvites()
      } else {
        toast.error('Failed to revoke invite')
      }
    } catch {
      toast.error('Failed to revoke invite')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    if (!window.confirm(`${isActive ? 'Disable' : 'Enable'} this staff account?`)) return
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (res.ok) { toast.success('Staff updated'); fetchStaff() }
      else { toast.error('Failed to update') }
    } catch { toast.error('Failed to update') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Staff Management</h1><p className="text-[13px] text-[--text-3]">Manage staff accounts and invites</p></div>
        <button onClick={() => { setShowInvite(true); setInviteUrl('') }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
          <Plus className="w-4 h-4" /> Invite Staff
        </button>
      </div>

      {/* Current Staff */}
      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="px-4 py-3 border-b border-[--border]"><h3 className="text-[13px] font-semibold text-[--text-1]">Current Staff</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Name</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Role</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden md:table-cell">Department</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] hidden lg:table-cell">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Status</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] w-20">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {loading ? [...Array(4)].map((_, i) => <tr key={i}>{[...Array(6)].map((__, j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-[--surface-2] rounded animate-pulse" /></td>)}</tr>)
              : staff.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[--surface-2]">
                    <td className="py-3 px-4 font-medium text-[--text-1]">{s.name}</td>
                    <td className="py-3 px-4 capitalize"><StatusBadge status={s.role} /></td>
                    <td className="py-3 px-4 text-[--text-2] hidden md:table-cell">{s.department || '—'}</td>
                    <td className="py-3 px-4 text-[--text-2] hidden lg:table-cell">{s.email}</td>
                    <td className="py-3 px-4"><StatusBadge status={s.isActive ? 'active' : 'discharged'} /></td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(s.id, s.isActive)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${s.isActive ? 'bg-[--danger-soft] text-[--danger] hover:bg-[--danger] hover:text-white' : 'bg-[--success-soft] text-[--success] hover:bg-[--success] hover:text-white'} transition-colors`}>
                        {s.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[--surface] rounded-xl border border-[--border] overflow-hidden">
        <div className="px-4 py-3 border-b border-[--border]">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Pending Staff Invites</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13px]">
            <thead className="bg-[--surface-2]">
              <tr>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Role</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Department</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3]">Expires</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase text-[--text-3] w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[--border]">
              {invites.length === 0 ? (
                <tr><td colSpan={5}><EmptyState icon={ShieldCheck} title="No pending invites" /></td></tr>
              ) : invites.map((invite: any) => (
                <tr key={invite.id} className="hover:bg-[--surface-2]">
                  <td className="py-3 px-4 text-[--text-1]">{invite.email}</td>
                  <td className="py-3 px-4 capitalize"><StatusBadge status={invite.role} /></td>
                  <td className="py-3 px-4 text-[--text-2]">{invite.department || 'None'}</td>
                  <td className="py-3 px-4 text-[--text-2]">{format(new Date(invite.expiresAt), 'dd MMM yyyy, hh:mm a')}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => copyLink(invite.inviteUrl)} className="p-2 rounded-lg bg-[--accent] text-white hover:bg-[--accent-hover]" aria-label="Copy invite link">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => revokeInvite(invite.id)} className="p-2 rounded-lg bg-[--danger-soft] text-[--danger] hover:bg-[--danger] hover:text-white" aria-label="Revoke invite">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <AppModal title="Invite Staff" onClose={() => { setShowInvite(false); setInviteUrl('') }} size="md">
            {!inviteUrl ? (
              <form onSubmit={handleInvite} className="space-y-3">
                <input placeholder="Email *" type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" required />
                <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]">
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="accountant">Accountant</option>
                </select>
                <input placeholder="Department" value={inviteForm.department} onChange={e => setInviteForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                <button type="submit" className="w-full py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover]">
                  Send Invite
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <p className="text-[13px] text-[--text-2]">Invite created. Share this secure link with the staff member so they can create their account:</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={inviteUrl} className="flex-1 px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[12px] text-[--text-1]" />
                  <button onClick={() => copyLink()} className="p-2 rounded-lg bg-[--accent] text-white hover:bg-[--accent-hover]">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => { setShowInvite(false); setInviteUrl('') }} className="w-full py-2 border border-[--border] rounded-lg text-[13px] font-medium text-[--text-2] hover:bg-[--surface-2]">
                  Close
                </button>
              </div>
            )}
        </AppModal>
      )}
    </div>
  )
}
