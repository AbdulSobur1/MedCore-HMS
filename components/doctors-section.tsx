'use client'

import { useState } from 'react'
import { Search, Star, Phone, Mail, Building2 } from 'lucide-react'

const DOCTORS_DATA = [
  {
    id: 'D001',
    name: 'Dr. Ahmed Hassan',
    specialization: 'Cardiology',
    qualification: 'MD, Board Certified',
    experience: '15 years',
    phone: '(555) 111-2222',
    email: 'ahmed.hassan@hospital.com',
    rating: 4.8,
    patientsCount: 342,
    availability: 'Available',
    room: '201',
  },
  {
    id: 'D002',
    name: 'Dr. Emily Garcia',
    specialization: 'Endocrinology',
    qualification: 'MD, Fellowship',
    experience: '12 years',
    phone: '(555) 222-3333',
    email: 'emily.garcia@hospital.com',
    rating: 4.9,
    patientsCount: 298,
    availability: 'Available',
    room: '305',
  },
  {
    id: 'D003',
    name: 'Dr. James Wilson',
    specialization: 'Pulmonology',
    qualification: 'MD, Board Certified',
    experience: '18 years',
    phone: '(555) 333-4444',
    email: 'james.wilson@hospital.com',
    rating: 4.7,
    patientsCount: 267,
    availability: 'In Surgery',
    room: '402',
  },
  {
    id: 'D004',
    name: 'Dr. Lisa Chen',
    specialization: 'Neurology',
    qualification: 'MD, Fellowship',
    experience: '10 years',
    phone: '(555) 444-5555',
    email: 'lisa.chen@hospital.com',
    rating: 4.9,
    patientsCount: 156,
    availability: 'Available',
    room: '501',
  },
]

export function DoctorsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('All')
  const [selectedDoctor, setSelectedDoctor] = useState<(typeof DOCTORS_DATA)[0] | null>(null)

  const specialties = ['All', 'Cardiology', 'Endocrinology', 'Pulmonology', 'Neurology']
  const filteredDoctors = DOCTORS_DATA.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialization === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Doctor Console</h1>
        <p className="text-muted-foreground mt-2">Manage medical staff and specialists</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-2">
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedSpecialty === specialty
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => setSelectedDoctor(doctor)}
            className={`bg-card border-2 rounded-lg p-6 cursor-pointer transition-all ${
              selectedDoctor?.id === doctor.id ? 'border-accent shadow-lg' : 'border-border hover:border-accent/50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">
                  {doctor.name
                    .split(' ')
                    .filter(w => !w.includes('.'))
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-semibold text-foreground">{doctor.rating}</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">{doctor.name}</h3>
            <p className="text-sm text-accent mb-4">{doctor.specialization}</p>

            <div className="space-y-2 mb-4 pb-4 border-b border-border">
              <p className="text-xs text-muted-foreground">{doctor.qualification}</p>
              <p className="text-xs text-muted-foreground">{doctor.experience}</p>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>Room {doctor.room}</span>
              </div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  doctor.availability === 'Available'
                    ? 'bg-success/20 text-success'
                    : 'bg-warning/20 text-warning'
                }`}
              >
                {doctor.availability}
              </span>
            </div>

            <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm">
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {/* Detailed View */}
      {selectedDoctor && (
        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Doctor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Name</p>
                <p className="text-lg font-semibold text-foreground">{selectedDoctor.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialization</p>
                <p className="text-lg font-semibold text-foreground">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Experience</p>
                <p className="text-lg font-semibold text-foreground">{selectedDoctor.experience}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Patients</p>
                <p className="text-lg font-semibold text-foreground">{selectedDoctor.patientsCount}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Qualification</p>
                <p className="text-lg font-semibold text-foreground">{selectedDoctor.qualification}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(selectedDoctor.rating) ? 'fill-warning text-warning' : 'text-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-foreground">{selectedDoctor.rating}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 flex items-center gap-2 px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <Phone className="w-5 h-5 text-foreground" />
                  <span className="text-foreground font-medium">{selectedDoctor.phone}</span>
                </button>
                <button className="flex-1 flex items-center gap-2 px-4 py-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <Mail className="w-5 h-5 text-foreground" />
                  <span className="text-foreground font-medium text-sm">Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
