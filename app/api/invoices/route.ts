import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { invoices, patients } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'
import { createInvoiceCode } from '@/lib/codes'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let result
    if (session.role === 'patient') {
      result = await db.select().from(invoices)
        .where(eq(invoices.patientId, session.id))
        .orderBy(invoices.createdAt)
    } else if (session.role === 'admin' || session.role === 'accountant') {
      result = await db.select().from(invoices)
        .orderBy(invoices.createdAt)
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ invoices: result })
  } catch (error) {
    console.error('Invoices list error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'accountant')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const invoiceCode = createInvoiceCode()

    const [inv] = await db.insert(invoices).values({
      invoiceCode,
      patientId: body.patientId,
      service: body.service,
      amount: body.amount,
      paymentMethod: body.paymentMethod || null,
      status: body.status || 'pending',
    }).returning()

    return NextResponse.json({ invoice: inv, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
