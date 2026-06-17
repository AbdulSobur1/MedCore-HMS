import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patients, staff, appointments, prescriptions, prescriptionDrugs, invoices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const [patientDetail] = await db.select({
      id: patients.id,
      patientCode: patients.patientCode,
      firstName: patients.firstName,
      lastName: patients.lastName,
      email: patients.email,
      phone: patients.phone,
      dob: patients.dob,
      gender: patients.gender,
      bloodType: patients.bloodType,
      address: patients.address,
      emergencyContact: patients.emergencyContact,
      insurance: patients.insurance,
      status: patients.status,
      ward: patients.ward,
      createdAt: patients.createdAt,
      doctorName: staff.name,
    }).from(patients)
    .leftJoin(staff, eq(patients.assignedDoctorId, staff.id))
    .where(eq(patients.id, id))
    .limit(1)

    if (!patientDetail) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    const patientAppointments = await db.select().from(appointments)
      .where(eq(appointments.patientId, id))
      .orderBy(appointments.scheduledAt)

    const patientPrescriptions = await db.select({
      id: prescriptions.id,
      diagnosis: prescriptions.diagnosis,
      notes: prescriptions.notes,
      status: prescriptions.status,
      createdAt: prescriptions.createdAt,
      doctorName: staff.name,
    }).from(prescriptions)
    .leftJoin(staff, eq(prescriptions.doctorId, staff.id))
    .where(eq(prescriptions.patientId, id))
    .orderBy(prescriptions.createdAt)

    const patientInvoices = await db.select().from(invoices)
      .where(eq(invoices.patientId, id))
      .orderBy(invoices.createdAt)

    return NextResponse.json({
      patient: patientDetail,
      appointments: patientAppointments,
      prescriptions: patientPrescriptions,
      invoices: patientInvoices,
    })
  } catch (error) {
    console.error('Admin patient detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch patient details' }, { status: 500 })
  }
}
