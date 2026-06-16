'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'

const PATIENT_DATA = [
  {
    id: 'P001',
    name: 'John Doe',
    age: 45,
    phone: '(555) 123-4567',
    email: 'john.doe@email.com',
    bloodType: 'O+',
    condition: 'Hypertension',
    lastVisit: '2024-05-28',
    status: 'Active',
  },
  {
    id: 'P002',
    name: 'Jane Smith',
    age: 32,
    phone: '(555) 234-5678',
    email: 'jane.smith@email.com',
    bloodType: 'A+',
    condition: 'Diabetes Type 2',
    lastVisit: '2024-05-20',
    status: 'Active',
  },
  {
    id: 'P003',
    name: 'Mike Johnson',
    age: 58,
    phone: '(555) 345-6789',
    email: 'mike.j@email.com',
    bloodType: 'B-',
    condition: 'Cardiac Arrhythmia',
    lastVisit: '2024-06-01',
    status: 'Critical',
  },
  {
    id: 'P004',
    name: 'Sarah Wilson',
    age: 28,
    phone: '(555) 456-7890',
    email: 'sarah.w@email.com',
    bloodType: 'AB+',
    condition: 'Respiratory Infection',
    lastVisit: '2024-05-25',
    status: 'Improving',
  },
  {
    id: 'P005',
    name: 'David Brown',
    age: 67,
    phone: '(555) 567-8901',
    email: 'david.b@email.com',
    bloodType: 'O-',
    condition: 'Joint Arthritis',
    lastVisit: '2024-05-15',
    status: 'Stable',
  },
]

export function PatientsSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPatient, setSelectedPatient] = useState<(typeof PATIENT_DATA)[0] | null>(null)

  const filteredPatients = PATIENT_DATA.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || patient.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground mt-2">Manage and view all patient records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          New Patient
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Active', 'Stable', 'Critical', 'Improving'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedStatus === status
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Patient List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">ID</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Name</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Condition</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => setSelectedPatient(patient)}
                      className="border-b border-border hover:bg-muted transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 text-foreground text-sm font-medium">{patient.id}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{patient.name}</td>
                      <td className="py-4 px-6 text-foreground text-sm">{patient.condition}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            patient.status === 'Critical'
                              ? 'bg-destructive/20 text-destructive'
                              : patient.status === 'Stable'
                                ? 'bg-success/20 text-success'
                                : patient.status === 'Active'
                                  ? 'bg-info/20 text-info'
                                  : 'bg-warning/20 text-warning'
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">{patient.lastVisit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Patient Details */}
        {selectedPatient ? (
          <div className="bg-card border border-border rounded-lg p-6 h-fit">
            <h3 className="text-lg font-semibold text-foreground mb-6">Patient Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">ID</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.age}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Blood Type</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{selectedPatient.email}</p>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                View Full Record
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 h-fit flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground text-center">Select a patient to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
