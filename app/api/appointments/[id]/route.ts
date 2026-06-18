import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appointments } from '@/lib/schema'
import { and, eq } from 'drizzle-orm'
import { getSession, jsonError, pickDefined, requireRoles } from '@/lib/api-utils'

const APPOINTMENT_STATUSES = ['confirmed', 'pending', 'cancelled', 'urgent'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)
    if (!requireRoles(session, ['admin', 'receptionist', 'doctor'])) return jsonError('Forbidden', 403)

    const { id } = await params
    const body = await request.json()
    const updates = pickDefined(body, ['status', 'scheduledAt', 'notes', 'type', 'department'] as const)

    if (updates.status && !APPOINTMENT_STATUSES.includes(updates.status as typeof APPOINTMENT_STATUSES[number])) {
      return jsonError('Invalid appointment status', 400)
    }
    if (updates.scheduledAt) updates.scheduledAt = new Date(updates.scheduledAt as string)
    if (Object.keys(updates).length === 0) return jsonError('No valid fields to update', 400)

    const condition = session.role === 'doctor'
      ? and(eq(appointments.id, id), eq(appointments.doctorId, session.id))
      : eq(appointments.id, id)

    await db.update(appointments).set(updates).where(condition)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Appointment update error:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}
