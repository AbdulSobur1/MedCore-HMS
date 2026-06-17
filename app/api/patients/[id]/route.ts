import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patients, staff } from '@/lib/schema'
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
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

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
      address: patients.address,
      emergencyContact: patients.emergencyContact,
      insurance: patients.insurance,
      status: patients.status,
      ward: patients.ward,
      createdAt: patients.createdAt,
      assignedDoctorId: patients.assignedDoctorId,
      doctorName: staff.name,
    }).from(patients)
    .leftJoin(staff, eq(patients.assignedDoctorId, staff.id))
    .where(eq(patients.id, id))
    .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    // Patients can only view their own record
    if (session.role === 'patient' && session.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ patient: result[0] })
  } catch (error) {
    console.error('Patient detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Only admin or the patient themselves can update
    if (session.role !== 'admin' && session.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Patients can only update limited fields
    if (session.role === 'patient') {
      const allowed = ['phone', 'address', 'emergencyContact']
      const filtered: Record<string, any> = {}
      for (const key of allowed) {
        if (body[key] !== undefined) filtered[key] = body[key]
      }
      await db.update(patients).set(filtered).where(eq(patients.id, id))
    } else {
      await db.update(patients).set(body).where(eq(patients.id, id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Patient update error:', error)
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}
