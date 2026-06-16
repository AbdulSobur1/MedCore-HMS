'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Lock, Users, Building2, ShieldCheck, Download } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

const TIMEZONES = ['UTC', 'Africa/Lagos', 'Africa/Nairobi', 'Africa/Johannesburg', 'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Kolkata', 'America/New_York', 'America/Sao_Paulo', 'Australia/Sydney']
const CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR', 'GHS', 'SAR', 'INR', 'BRL', 'AUD']
const LOCALES = ['en-US', 'en-GB', 'fr-FR', 'ar-SA', 'pt-BR']

export function AdminSection() {
  const [activeTab, setActiveTab] = useState<'staff' | 'departments' | 'settings' | 'audit'>('staff')
  const [searchTerm, setSearchTerm] = useState('')
  const [staff, setStaff] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({})
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditStaff, setShowEditStaff] = useState<any | null>(null)
  const [showDeleteStaff, setShowDeleteStaff] = useState<any | null>(null)
  const [auditFilters, setAuditFilters] = useState({ from: '', to: '', resourceType: '' })

  useEffect(() => {
    fetchStaff()
    fetchSettings()
  }, [])

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/doctors')
      if (res.ok) { const d = await res.json(); setStaff(d.doctors || []) }
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) { const d = await res.json(); setSettings(d.settings || {}) }
    } catch { /* ignore */ }
  }

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (auditFilters.from) params.set('from', auditFilters.from)
      if (auditFilters.to) params.set('to', auditFilters.to)
      if (auditFilters.resourceType) params.set('resourceType', auditFilters.resourceType)
      const res = await fetch(`/api/audit?${params}`)
      if (res.ok) { const d = await res.json(); setAuditLogs(d.logs || []); setAuditTotal(d.total || 0) }
    } catch { toast.error('Failed to load audit logs') }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) { toast.success('Settings saved') }
      else { toast.error('Failed to save settings') }
    } catch { toast.error('Failed to save settings') }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  const exportAuditCsv = () => {
    if (!auditLogs.length) return
    const headers = 'Timestamp,User,Action,Resource Type,Resource ID,IP Address'
    const rows = auditLogs.map((l: any) =>
      `"${l.timestamp}","${l.userId}","${l.action}","${l.resourceType}","${l.resourceId}","${l.ipAddress}"`
    ).join('\n')
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'audit_logs.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const ActionBadge = ({ action }: { action: string }) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-info/20 text-info',
      READ: 'bg-muted text-muted-foreground',
      UPDATE: 'bg-warning/20 text-warning',
      DELETE: 'bg-destructive/20 text-destructive',
    }
    return <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors[action] || 'bg-muted text-muted-foreground'}`}>{action}</span>
  }

  const filteredStaff = staff.filter((s) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Administration</h1>
          <p className="text-muted-foreground mt-2">Manage staff, system settings, and view audit logs</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-border overflow-x-auto">
        {(['staff', 'settings', 'audit'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}>
            {tab === 'staff' && <Users className="w-4 h-4" />}
            {tab === 'settings' && <Lock className="w-4 h-4" />}
            {tab === 'audit' && <ShieldCheck className="w-4 h-4" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search by name or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Role</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Department</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        {[...Array(6)].map((__, j) => (
                          <td key={j} className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredStaff.map((s) => (
                    <tr key={s.staffId || s.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{s.staffId || s.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{s.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm capitalize">{s.role}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{s.department}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{s.email}</td>
                      <td className="py-4 px-6 flex gap-2">
                        <button onClick={() => setShowEditStaff(s)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Edit2 className="w-4 h-4 text-foreground" /></button>
                        <button onClick={() => setShowDeleteStaff(s)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Trash2 className="w-4 h-4 text-destructive" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Hospital Settings</h3>
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Hospital Name</label>
                  <input type="text" value={settings.hospitalName || ''} onChange={(e) => updateSetting('hospitalName', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input type="email" value={settings.email || ''} onChange={(e) => updateSetting('email', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                  <input type="tel" value={settings.phone || ''} onChange={(e) => updateSetting('phone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
                  <select value={settings.timezone || 'UTC'} onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm">
                    {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
                  <select value={settings.currency || 'USD'} onChange={(e) => updateSetting('currency', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm">
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Locale</label>
                  <select value={settings.locale || 'en-US'} onChange={(e) => updateSetting('locale', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm">
                    {LOCALES.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">Save Changes</button>
              </form>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'notifications.email', label: 'Email Notifications', defaultVal: true },
                  { key: 'notifications.sms', label: 'SMS Alerts', defaultVal: true },
                  { key: 'maintenanceMode', label: 'Maintenance Mode', defaultVal: false },
                  { key: 'twoFactor', label: 'Two-Factor Authentication', defaultVal: true },
                ].map(({ key, label, defaultVal }) => {
                  const keys = key.split('.')
                  const checked = keys.length === 2 ? settings[keys[0]]?.[keys[1]] ?? defaultVal : settings[key] ?? defaultVal
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">{label}</label>
                      <input type="checkbox" checked={checked} onChange={(e) => {
                        if (keys.length === 2) {
                          updateSetting(keys[0], { ...(settings[keys[0]] || {}), [keys[1]]: e.target.checked })
                        } else {
                          updateSetting(key, e.target.checked)
                        }
                      }} className="w-5 h-5 rounded accent-accent" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{auditTotal} total entries</p>
            <button onClick={exportAuditCsv} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" /> Export as CSV
            </button>
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <input type="date" value={auditFilters.from} onChange={(e) => setAuditFilters(f => ({ ...f, from: e.target.value }))}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground" />
            <input type="date" value={auditFilters.to} onChange={(e) => setAuditFilters(f => ({ ...f, to: e.target.value }))}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground" />
            <select value={auditFilters.resourceType} onChange={(e) => setAuditFilters(f => ({ ...f, resourceType: e.target.value }))}
              className="px-4 py-2 rounded-lg bg-card border border-border text-sm text-foreground">
              <option value="">All Types</option>
              <option value="patient">Patient</option>
              <option value="prescription">Prescription</option>
              <option value="invoice">Invoice</option>
              <option value="appointment">Appointment</option>
              <option value="staff">Staff</option>
              <option value="settings">Settings</option>
            </select>
            <button onClick={fetchAuditLogs} className="px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">Filter</button>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Timestamp</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">User</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Action</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Resource Type</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Resource ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">Click "Filter" to load logs</td></tr>
                  ) : auditLogs.map((log: any) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted transition-colors">
                      <td className="py-4 px-6 text-muted-foreground text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{log.userId}</td>
                      <td className="py-4 px-6"><ActionBadge action={log.action} /></td>
                      <td className="py-4 px-6 text-foreground text-sm capitalize">{log.resourceType}</td>
                      <td className="py-4 px-6 text-foreground text-sm font-mono text-xs">{log.resourceId}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{log.ipAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!showEditStaff} onOpenChange={(o) => { if (!o) setShowEditStaff(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Staff</DialogTitle></DialogHeader>
          {showEditStaff && (
            <div className="space-y-4">
              <p className="text-sm text-foreground">Editing: {showEditStaff.name}</p>
              <p className="text-xs text-muted-foreground">Staff management edit operations not yet implemented via API.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!showDeleteStaff} onOpenChange={(o) => { if (!o) setShowDeleteStaff(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {showDeleteStaff?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { toast.error('Delete not yet implemented via API'); setShowDeleteStaff(null) }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
