import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { prescriptions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession, jsonError, pickDefined, requireRoles } from '@/lib/api-utils'

const PRESCRIPTION_STATUSES = ['pending', 'dispensed'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)
    if (!requireRoles(session, ['pharmacist', 'admin'])) return jsonError('Forbidden', 403)

    const { id } = await params
    const body = await request.json()
    const updates = pickDefined(body, ['status', 'notes'] as const)

    if (updates.status && !PRESCRIPTION_STATUSES.includes(updates.status as typeof PRESCRIPTION_STATUSES[number])) {
      return jsonError('Invalid prescription status', 400)
    }
    if (Object.keys(updates).length === 0) return jsonError('No valid fields to update', 400)

    await db.update(prescriptions).set(updates).where(eq(prescriptions.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Prescription update error:', error)
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 })
  }
}
