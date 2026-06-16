'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Calendar, FileText, Heart, Phone, AlertTriangle, LogOut, Download, Clock, User, Mail, MapPin, Syringe } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface PatientProfile {
  patientId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  bloodType: string
  address?: string
  emergencyContact?: string
}

interface Appointment {
  id: string
  doctorName: string
  department: string
  date: string
  time: string
  room: string
  status: string
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  prescribedBy: string
  date: string
  status: string
}

export default function PatientDashboard() {
  const router = useRouter()
  const { session, logout, isLoading } = useAuth()
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true)
  const [showEmergency, setShowEmergency] = useState(false)

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/auth/landing')
    }
  }, [session, isLoading, router])

  useEffect(() => {
    if (!session) return

    async function fetchProfile() {
      try {
        const res = await fetch('/api/patient/profile')
        if (res.ok) {
          const data = await res.json()
          setProfile(data.patient)
        }
      } catch {
        // ignore
      } finally {
        setLoadingProfile(false)
      }
    }

    async function fetchAppointments() {
      try {
        const res = await fetch('/api/patient/appointments')
        if (res.ok) {
          const data = await res.json()
          setAppointments(data.appointments)
        }
      } catch {
        // ignore
      } finally {
        setLoadingAppointments(false)
      }
    }

    async function fetchPrescriptions() {
      try {
        const res = await fetch('/api/patient/prescriptions')
        if (res.ok) {
          const data = await res.json()
          setPrescriptions(data.prescriptions)
        }
      } catch {
        // ignore
      } finally {
        setLoadingPrescriptions(false)
      }
    }

    fetchProfile()
    fetchAppointments()
    fetchPrescriptions()
  }, [session])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/landing')
  }

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const hospitalPhone = '+1 (555) 000-0000'

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, {session.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* 1. Patient Profile Summary Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">My Profile</h2>
          {loadingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient ID</p>
                <p className="text-sm font-medium text-foreground">{profile.patientId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                <p className="text-sm font-medium text-foreground">{profile.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-medium text-foreground">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="text-sm font-medium text-foreground">{profile.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Date of Birth</p>
                <p className="text-sm font-medium text-foreground">{profile.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Blood Type</p>
                <p className="text-sm font-medium text-foreground">{profile.bloodType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="text-sm font-medium text-foreground capitalize">
                  {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : profile.gender}
                </p>
              </div>
              {profile.address && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-sm font-medium text-foreground">{profile.address}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Profile data unavailable</p>
          )}
        </div>

        {/* 2. Upcoming Appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
            <button
              disabled
              title="Coming soon"
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 text-accent-foreground rounded-lg font-medium text-sm cursor-not-allowed opacity-60"
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>
          </div>

          {loadingAppointments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{apt.doctorName}</p>
                      <p className="text-xs text-muted-foreground">{apt.department}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'Confirmed' ? 'bg-info/20 text-info' :
                      apt.status === 'Completed' ? 'bg-success/20 text-success' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{apt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Room {apt.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            </div>
          )}
        </div>

        {/* 3. Prescriptions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">My Prescriptions</h2>

          {loadingPrescriptions ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Medication</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Dosage</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Prescribed By</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Date</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="border-b border-border hover:bg-muted transition-colors">
                        <td className="py-4 px-6 text-foreground text-sm font-medium">{rx.medication}</td>
                        <td className="py-4 px-6 text-foreground text-sm">{rx.dosage}</td>
                        <td className="py-4 px-6 text-foreground text-sm">{rx.prescribedBy}</td>
                        <td className="py-4 px-6 text-muted-foreground text-sm">{rx.date}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            rx.status === 'Dispensed' ? 'bg-success/20 text-success' :
                            rx.status === 'Ready' ? 'bg-info/20 text-info' :
                            'bg-warning/20 text-warning'
                          }`}>
                            {rx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Syringe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No prescriptions yet</p>
            </div>
          )}
        </div>

        {/* 4. Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => toast.success('Your records will be emailed to you')}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors text-left"
            >
              <Download className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">Download Records</h3>
              <p className="text-xs text-muted-foreground">Get your medical records via email</p>
            </button>

            <button
              onClick={() => toast.info(`Hospital reception: ${hospitalPhone}`)}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors text-left"
            >
              <Phone className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">Contact Reception</h3>
              <p className="text-xs text-muted-foreground">Call or message the front desk</p>
            </button>

            <button
              onClick={() => setShowEmergency(true)}
              className="bg-card border border-border rounded-lg p-6 hover:border-destructive/40 transition-colors text-left"
            >
              <AlertTriangle className="w-6 h-6 text-destructive mb-3" />
              <h3 className="font-medium text-foreground text-sm mb-1">Emergency</h3>
              <p className="text-xs text-muted-foreground">View emergency contact information</p>
            </button>
          </div>
        </div>

        {/* Emergency Dialog */}
        <Dialog open={showEmergency} onOpenChange={setShowEmergency}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Emergency Contact
              </DialogTitle>
              <DialogDescription>
                If you are experiencing a medical emergency, please contact:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-foreground">Hospital Emergency Line</p>
                <p className="text-lg font-bold text-destructive">{hospitalPhone}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Emergency Services</p>
                <p className="text-sm text-muted-foreground">For immediate assistance, dial 911 or visit the nearest emergency room.</p>
              </div>
              {profile?.emergencyContact && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">Emergency Contact (on file)</p>
                  <p className="text-sm text-muted-foreground">{profile.emergencyContact}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
