'use client'

import { useState } from 'react'
import { Plus, Calendar, Clock, MapPin, User } from 'lucide-react'

const APPOINTMENTS_DATA = [
  {
    id: 'APT001',
    patientName: 'John Doe',
    patientId: 'P001',
    doctor: 'Dr. Ahmed Hassan',
    department: 'Cardiology',
    date: '2024-06-15',
    time: '09:00 AM',
    room: '201',
    status: 'Scheduled',
    type: 'Consultation',
  },
  {
    id: 'APT002',
    patientName: 'Jane Smith',
    patientId: 'P002',
    doctor: 'Dr. Emily Garcia',
    department: 'Endocrinology',
    date: '2024-06-15',
    time: '10:30 AM',
    room: '305',
    status: 'Confirmed',
    type: 'Follow-up',
  },
  {
    id: 'APT003',
    patientName: 'Mike Johnson',
    patientId: 'P003',
    doctor: 'Dr. Ahmed Hassan',
    department: 'Cardiology',
    date: '2024-06-16',
    time: '02:00 PM',
    room: '201',
    status: 'Pending',
    type: 'Consultation',
  },
  {
    id: 'APT004',
    patientName: 'Sarah Wilson',
    patientId: 'P004',
    doctor: 'Dr. James Wilson',
    department: 'Pulmonology',
    date: '2024-06-14',
    time: '04:00 PM',
    room: '402',
    status: 'Completed',
    type: 'Check-up',
  },
]

export function AppointmentsSection() {
  const [selectedDate, setSelectedDate] = useState('2024-06-15')

  const filteredAppointments = APPOINTMENTS_DATA.filter((apt) => apt.date === selectedDate)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-2">Schedule and manage patient appointments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-4">Select Date</h3>
          <div className="space-y-2">
            {['2024-06-14', '2024-06-15', '2024-06-16', '2024-06-17'].map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  selectedDate === date
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-3">
          <div className="space-y-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{appointment.patientName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{appointment.type}</p>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Completed'
                          ? 'bg-success/20 text-success'
                          : appointment.status === 'Confirmed'
                            ? 'bg-info/20 text-info'
                            : appointment.status === 'Pending'
                              ? 'bg-warning/20 text-warning'
                              : 'bg-accent/20 text-accent'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{appointment.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Room {appointment.room}</span>
                    </div>
                    <div className="text-muted-foreground">{appointment.department}</div>
                  </div>

                  <button className="w-full mt-4 px-3 py-2 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No appointments for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
