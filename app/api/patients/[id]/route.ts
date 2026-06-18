import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patients, staff } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession, jsonError, pickDefined } from '@/lib/api-utils'

const PATIENT_STATUSES = ['admitted', 'outpatient', 'critical', 'discharged'] as const

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)

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
      return jsonError('Forbidden', 403)
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
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)

    const { id } = await params

    // Only admin or the patient themselves can update
    if (session.role !== 'admin' && session.id !== id) {
      return jsonError('Forbidden', 403)
    }

    const body = await request.json()

    // Patients can only update limited fields
    if (session.role === 'patient') {
      const filtered = pickDefined(body, ['phone', 'address', 'emergencyContact'] as const)
      if (Object.keys(filtered).length === 0) return jsonError('No valid fields to update', 400)
      await db.update(patients).set(filtered).where(eq(patients.id, id))
    } else {
      const filtered = pickDefined(body, [
        'firstName', 'lastName', 'email', 'phone', 'dob', 'gender', 'bloodType',
        'address', 'emergencyContact', 'insurance', 'status', 'ward', 'assignedDoctorId',
      ] as const)
      if (filtered.status && !PATIENT_STATUSES.includes(filtered.status as typeof PATIENT_STATUSES[number])) {
        return jsonError('Invalid patient status', 400)
      }
      if (Object.keys(filtered).length === 0) return jsonError('No valid fields to update', 400)
      await db.update(patients).set(filtered).where(eq(patients.id, id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Patient update error:', error)
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 })
  }
}
