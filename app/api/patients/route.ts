import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patients, staff } from '@/lib/schema'
import { eq, sql } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'doctor' && session.role !== 'receptionist')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await db.select({
      id: patients.id,
      patientCode: patients.patientCode,
      firstName: patients.firstName,
      lastName: patients.lastName,
      email: patients.email,
      phone: patients.phone,
      dob: patients.dob,
      gender: patients.gender,
      bloodType: patients.bloodType,
      status: patients.status,
      ward: patients.ward,
      createdAt: patients.createdAt,
      assignedDoctorId: patients.assignedDoctorId,
      doctorName: staff.name,
    }).from(patients)
    .leftJoin(staff, eq(patients.assignedDoctorId, staff.id))
    .orderBy(patients.createdAt)

    return NextResponse.json({ patients: result })
  } catch (error) {
    console.error('Patients list error:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'receptionist')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Generate patient code
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(patients)
    const count = Number(countResult[0]?.count || 0)
    const patientCode = `PT-${String(count + 1).padStart(4, '0')}`

    // Temp password = patientCode
    const passwordHash = await bcrypt.hash(patientCode, 10)

    const [patient] = await db.insert(patients).values({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      dob: body.dob || '',
      gender: body.gender || 'Other',
      passwordHash,
      patientCode,
      bloodType: body.bloodType || null,
      address: body.address || null,
      emergencyContact: body.emergencyContact || null,
      insurance: body.insurance || null,
      status: body.status || 'outpatient',
      ward: body.ward || null,
      assignedDoctorId: body.assignedDoctorId || null,
    }).returning()

    return NextResponse.json({ patient, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
