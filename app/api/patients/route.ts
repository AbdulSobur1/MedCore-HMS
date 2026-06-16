import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patients = await readDataFile<Record<string, any>>('patients.json')
    const patientList = Object.entries(patients).map(([id, p]) => ({ id, ...p }))

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
    const patients = await readDataFile<Record<string, any>>('patients.json')

    const patientId = `PAT-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const patient = {
      patientId,
      ...body,
      createdAt: new Date().toISOString(),
    }

    patients[patientId] = patient
    await writeDataFile('patients.json', patients)

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
