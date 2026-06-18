import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appointments, patients, staff } from '@/lib/schema'
import { eq, gte, lte, and } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date')
    const status = searchParams.get('status')

    const conditions = []

    // Role scoping
    if (session.role === 'doctor') {
      conditions.push(eq(appointments.doctorId, session.id))
    } else if (session.role === 'patient') {
      conditions.push(eq(appointments.patientId, session.id))
    }

    if (dateFilter) {
      const start = new Date(dateFilter)
      const end = new Date(dateFilter)
      end.setDate(end.getDate() + 1)
      conditions.push(gte(appointments.scheduledAt, start))
      conditions.push(lte(appointments.scheduledAt, end))
    }

    if (status) {
      conditions.push(eq(appointments.status, status as any))
    }

    const query = db.select({
      id: appointments.id,
      patientId: appointments.patientId,
      doctorId: appointments.doctorId,
      type: appointments.type,
      department: appointments.department,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      patientName: patients.firstName,
      patientLastName: patients.lastName,
      doctorName: staff.name,
    }).from(appointments)
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .leftJoin(staff, eq(appointments.doctorId, staff.id))

    const finalQuery = conditions.length > 0 ? query.where(and(...conditions)) : query
    const result = await finalQuery.orderBy(appointments.scheduledAt)

    return NextResponse.json({ appointments: result })
  } catch (error) {
    console.error('Appointments list error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || !['admin', 'receptionist', 'patient'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    if (session.role === 'patient' && !String(body.notes || '').trim()) {
      return NextResponse.json({ error: 'Please describe what seems to be wrong before booking.' }, { status: 400 })
    }

    const [appt] = await db.insert(appointments).values({
      patientId: body.patientId || (session.role === 'patient' ? session.id : null),
      doctorId: body.doctorId,
      type: body.type,
      department: body.department || null,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes || null,
      status: session.role === 'patient' ? 'pending' : (body.status || 'pending'),
    }).returning()

    return NextResponse.json({ appointment: appt, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
