'use client'

import { useState, useEffect } from 'react'
import { Search, Star, Phone, Mail, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function DoctorsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/doctors')
      if (res.ok) {
        const data = await res.json()
        setDoctors(data.doctors || [])
      }
    } catch {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const specialties = ['All', ...new Set(doctors.map((d: any) => d.department || d.specialization).filter(Boolean))]
  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name || ''
    const dept = doctor.department || doctor.specialization || ''
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || dept.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'All' || dept === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const getInitials = (name: string) =>
    name.split(' ').filter((w) => !w.includes('.')).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctor Console</h1>
        <p className="text-muted-foreground mt-2">Manage medical staff and specialists</p>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search doctors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent" />
        </div>
        {specialties.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {specialties.slice(0, 6).map((s) => (
              <button key={s} onClick={() => setSelectedSpecialty(s)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${selectedSpecialty === s ? 'bg-accent text-accent-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'}`}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))
        ) : filteredDoctors.map((doctor) => (
          <div key={doctor.staffId || doctor.id} onClick={() => setSelectedDoctor(doctor)}
            className={`bg-card border-2 rounded-lg p-6 cursor-pointer transition-all ${selectedDoctor?.staffId === doctor.staffId ? 'border-accent shadow-lg' : 'border-border hover:border-accent/50'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">{getInitials(doctor.name)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-semibold text-foreground">{doctor.rating || '—'}</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{doctor.name}</h3>
            <p className="text-sm text-accent mb-4">{doctor.department || doctor.specialization}</p>
            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground">{doctor.qualification || doctor.role || 'Doctor'}</p>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${doctor.isActive !== false ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                {doctor.isActive !== false ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">Book Appointment</button>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Doctor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div><p className="text-sm text-muted-foreground mb-2">Name</p><p className="text-lg font-semibold text-foreground">{selectedDoctor.name}</p></div>
              <div><p className="text-sm text-muted-foreground mb-2">Department</p><p className="text-lg font-semibold text-foreground">{selectedDoctor.department || selectedDoctor.specialization}</p></div>
              <div><p className="text-sm text-muted-foreground mb-2">Email</p><p className="text-lg font-semibold text-foreground">{selectedDoctor.email}</p></div>
            </div>
            <div className="space-y-6">
              <div><p className="text-sm text-muted-foreground mb-2">Phone</p><p className="text-lg font-semibold text-foreground">{selectedDoctor.phone || '—'}</p></div>
              <div className="flex gap-4">
                <button className="flex-1 flex items-center gap-2 px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" /><span className="text-foreground font-medium">{selectedDoctor.phone || 'Call'}</span>
                </button>
                <button className="flex-1 flex items-center gap-2 px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <Mail className="w-5 h-5 text-foreground" /><span className="text-foreground font-medium text-sm">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
