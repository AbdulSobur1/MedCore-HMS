import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getAppointments, createAppointment } from '@/lib/data'
import { writeAuditLog } from '@/lib/audit'

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date') || undefined

    const appointments = await getAppointments(dateFilter)

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Appointments list error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const appointment = {
      id: `APT-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    }

    await createAppointment(appointment)

    await writeAuditLog({
      userId: session.userId,
      userRole: session.role || 'staff',
      action: 'CREATE',
      resourceType: 'appointment',
      resourceId: appointment.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }, request)

    return NextResponse.json({ appointment, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
