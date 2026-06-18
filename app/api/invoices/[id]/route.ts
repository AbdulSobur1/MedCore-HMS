import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession, jsonError, pickDefined, requireRoles } from '@/lib/api-utils'

const INVOICE_STATUSES = ['paid', 'pending', 'overdue', 'processing'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return jsonError('Unauthorized', 401)
    if (!requireRoles(session, ['admin', 'accountant'])) return jsonError('Forbidden', 403)

    const { id } = await params
    const body = await request.json()
    const updates = pickDefined(body, ['service', 'amount', 'paymentMethod', 'status'] as const)

    if (updates.status && !INVOICE_STATUSES.includes(updates.status as typeof INVOICE_STATUSES[number])) {
      return jsonError('Invalid invoice status', 400)
    }
    if (Object.keys(updates).length === 0) return jsonError('No valid fields to update', 400)

    await db.update(invoices).set(updates).where(eq(invoices.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
