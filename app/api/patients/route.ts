import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getAllPatients, createPatient } from '@/lib/data'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patients = await getAllPatients()
    // Add 'id' field matching patientId for backwards compatibility
    const patientList = patients.map((p: any) => ({ ...p, id: p.patientId }))

    return NextResponse.json({ patients: patientList })
  } catch (error) {
    console.error('Patients list error:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const patientId = `PAT-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const patient = {
      patientId,
      ...body,
      createdAt: new Date(),
    }

    await createPatient(patient)

    await writeAuditLog({
      userId: session.userId,
      userRole: session.role || 'staff',
      action: 'CREATE',
      resourceType: 'patient',
      resourceId: patientId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }, request)

    return NextResponse.json({ patient, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create patient error:', error)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
