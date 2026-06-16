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

    const prescriptions = await readDataFile<any[]>('prescriptions.json')
    return NextResponse.json({ prescriptions })
  } catch (error) {
    console.error('Prescriptions list error:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const prescriptions = await readDataFile<any[]>('prescriptions.json')

    const prescription = {
      id: `RX-${Date.now()}`,
      ...body,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    }

    prescriptions.push(prescription)
    await writeDataFile('prescriptions.json', prescriptions)

    await writeAuditLog({
      userId: session.userId,
      userRole: session.role || 'staff',
      action: 'CREATE',
      resourceType: 'prescription',
      resourceId: prescription.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }, request)

    return NextResponse.json({ prescription, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create prescription error:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}
