import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession, jsonError, pickDefined } from '@/lib/api-utils'

const STAFF_ROLES = ['admin', 'doctor', 'receptionist', 'pharmacist', 'accountant'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)
    if (!session || session.role !== 'admin') {
      return jsonError('Forbidden', 403)
    }

    const { id } = await params
    const body = await request.json()
    const updates = pickDefined(body, ['name', 'role', 'department', 'phone', 'isActive'] as const)

    if (updates.role && !STAFF_ROLES.includes(updates.role as typeof STAFF_ROLES[number])) {
      return jsonError('Invalid staff role', 400)
    }
    if (Object.keys(updates).length === 0) return jsonError('No valid fields to update', 400)

    await db.update(staff).set(updates).where(eq(staff.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}
