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
  const weekEnd = new Date(todayEnd)

  const [{ count: totalPatients }] = await db.select({ count: sql<number>`count(*)` }).from(patients)
  const [{ count: todayAppts }] = await db.select({ count: sql<number>`count(*)` }).from(appointments)
    .where(and(gte(appointments.scheduledAt, todayStart), lte(appointments.scheduledAt, todayEnd)))
  const [{ count: activeStaff }] = await db.select({ count: sql<number>`count(*)` }).from(staff)
    .where(eq(staff.isActive, true))
  const [{ count: pendingInvoices }] = await db.select({ count: sql<number>`count(*)` }).from(invoices)
    .where(eq(invoices.status, 'pending'))

  // Weekly patient activity from real patient records
  const weeklyPatients = await db.select({
    createdAt: patients.createdAt,
    status: patients.status,
  }).from(patients)
    .where(and(gte(patients.createdAt, weekStart), lte(patients.createdAt, weekEnd)))

  const weeklyData = dayNames.map((day, i) => {
    const dayDate = new Date(weekStart)
    dayDate.setDate(dayDate.getDate() + i)
    const dayEnd = new Date(dayDate)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const dayPatients = weeklyPatients.filter(p => {
      const d = new Date(p.createdAt)
      return d >= dayDate && d < dayEnd
    })

    return {
      day,
      registered: dayPatients.length,
      discharged: dayPatients.filter(p => p.status === 'discharged').length,
    }
  })

  // Department data from real staff records
  const staffByDept = await db.select({
    department: staff.department,
    count: sql<number>`count(*)`,
  }).from(staff)
    .where(eq(staff.isActive, true))
    .groupBy(staff.department)
    .orderBy(staff.department)

  const deptData = staffByDept.map(d => ({
    name: d.department || 'Unassigned',
    count: Number(d.count),
  }))

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
