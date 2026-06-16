'use client'

import { useState, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export function PatientsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showNewPatient, setShowNewPatient] = useState(false)
  const [showFullRecord, setShowFullRecord] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', gender: 'M', bloodType: 'O+', address: '', emergencyContact: '',
  })

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      if (res.ok) {
        const data = await res.json()
        setPatients(data.patients || [])
      }
    } catch {
      toast.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPatient),
      })
      if (res.ok) {
        toast.success('Patient added successfully')
        setShowNewPatient(false)
        setNewPatient({ name: '', email: '', phone: '', dateOfBirth: '', gender: 'M', bloodType: 'O+', address: '', emergencyContact: '' })
        fetchPatients()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to add patient')
      }
    } catch {
      toast.error('Failed to add patient')
    }
  }

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground mt-2">Manage and view all patient records</p>
        </div>
        <button onClick={() => setShowNewPatient(true)} className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> New Patient
        </button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Stable', 'Critical', 'Improving'].map((s) => (
            <button key={s} onClick={() => setSelectedStatus(s)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedStatus === s ? 'bg-accent text-accent-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Email</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Blood Type</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-border">
                        <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-12" /></td>
                        <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                      </tr>
                    ))
                  ) : filteredPatients.map((patient) => (
                    <tr key={patient.patientId} onClick={() => setSelectedPatient(patient)}
                      className="border-b border-border hover:bg-muted transition-colors cursor-pointer">
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{patient.patientId}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{patient.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{patient.email}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{patient.bloodType}</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{patient.createdAt?.split('T')[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 h-fit">
          {selectedPatient ? (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-6">Patient Details</h3>
              <div className="space-y-4">
                <div><p className="text-xs text-muted-foreground mb-1">ID</p><p className="text-sm font-medium text-foreground">{selectedPatient.patientId}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Full Name</p><p className="text-sm font-medium text-foreground">{selectedPatient.name}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Email</p><p className="text-sm font-medium text-foreground">{selectedPatient.email}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Phone</p><p className="text-sm font-medium text-foreground">{selectedPatient.phone}</p></div>
                <div><p className="text-xs text-muted-foreground mb-1">Blood Type</p><p className="text-sm font-medium text-foreground">{selectedPatient.bloodType}</p></div>
                <button onClick={() => setShowFullRecord(true)} className="w-full mt-6 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">View Full Record</button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <p className="text-muted-foreground text-center">Select a patient to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Patient Dialog */}
      <Dialog open={showNewPatient} onOpenChange={setShowNewPatient}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Patient</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPatient} className="space-y-4">
            <input name="name" placeholder="Full Name" value={newPatient.name} onChange={(e) => setNewPatient(p => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input name="email" type="email" placeholder="Email" value={newPatient.email} onChange={(e) => setNewPatient(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input name="phone" placeholder="Phone" value={newPatient.phone} onChange={(e) => setNewPatient(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" required />
            <input name="dateOfBirth" type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient(p => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm" />
            <button type="submit" className="w-full py-2 px-4 bg-accent text-accent-foreground rounded-lg font-medium text-sm hover:opacity-90">Add Patient</button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Full Record Dialog */}
      <Dialog open={showFullRecord} onOpenChange={setShowFullRecord}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Full Patient Record</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(selectedPatient).map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
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
