import { db } from '@/lib/db'
import { patients, staff, appointments, invoices } from '@/lib/schema'
import { eq, sql, and, gte, lte } from 'drizzle-orm'
import { AdminDashboardClient } from './client'

export const dynamic = 'force-dynamic'

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function AdminDashboardPage() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())

  const [{ count: totalPatients }] = await db.select({ count: sql<number>`count(*)` }).from(patients)
  const [{ count: todayAppts }] = await db.select({ count: sql<number>`count(*)` }).from(appointments)
    .where(and(gte(appointments.scheduledAt, todayStart), lte(appointments.scheduledAt, todayEnd)))
  const [{ count: activeStaff }] = await db.select({ count: sql<number>`count(*)` }).from(staff)
    .where(eq(staff.isActive, true))
  const [{ count: pendingInvoices }] = await db.select({ count: sql<number>`count(*)` }).from(invoices)
    .where(eq(invoices.status, 'pending'))

  // Weekly data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart)
    day.setDate(day.getDate() + i)
    return { day: dayNames[day.getDay()], admitted: Math.floor(Math.random() * 15 + 5), discharged: Math.floor(Math.random() * 10 + 3) }
  })

  // Department data
  const deptData = [
    { name: 'Cardiology', count: 42 },
    { name: 'Pediatrics', count: 38 },
    { name: 'Orthopedics', count: 25 },
    { name: 'Neurology', count: 18 },
    { name: 'General', count: 55 },
  ]

  // Recent patients
  const recentPatients = await db.select({
    id: patients.id,
    patientCode: patients.patientCode,
    firstName: patients.firstName,
    lastName: patients.lastName,
    status: patients.status,
    createdAt: patients.createdAt,
    doctorName: staff.name,
  }).from(patients)
  .leftJoin(staff, eq(patients.assignedDoctorId, staff.id))
  .orderBy(sql`${patients.createdAt} desc`)
  .limit(10)

  // Today's appointments
  const todayAppointments = await db.select({
    id: appointments.id,
    patientId: appointments.patientId,
    type: appointments.type,
    scheduledAt: appointments.scheduledAt,
    status: appointments.status,
    patientName: patients.firstName,
    patientLastName: patients.lastName,
    doctorName: staff.name,
  }).from(appointments)
  .leftJoin(patients, eq(appointments.patientId, patients.id))
  .leftJoin(staff, eq(appointments.doctorId, staff.id))
  .where(and(gte(appointments.scheduledAt, todayStart), lte(appointments.scheduledAt, todayEnd)))
  .orderBy(appointments.scheduledAt)

  return (
    <AdminDashboardClient
      totalPatients={Number(totalPatients)}
      todayAppts={Number(todayAppts)}
      activeStaff={Number(activeStaff)}
      pendingInvoices={Number(pendingInvoices)}
      weeklyData={weeklyData}
      departmentData={deptData}
      recentPatients={recentPatients.map(p => ({
        ...p,
        name: `${p.firstName} ${p.lastName}`,
      }))}
      todayAppointments={todayAppointments.map(a => ({
        ...a,
        patientName: `${a.patientName || ''} ${a.patientLastName || ''}`.trim(),
        time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      }))}
    />
  )
}
