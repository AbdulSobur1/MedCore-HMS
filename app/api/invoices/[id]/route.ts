import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'accountant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    await db.update(invoices).set(body).where(eq(invoices.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invoice update error:', error)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
