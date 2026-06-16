import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getInvoices, createInvoice } from '@/lib/data'
import { writeAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoices = await getInvoices()
    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('Invoices list error:', error)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const invoice = {
      id: `INV-${Date.now()}`,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'Pending',
      createdAt: new Date(),
    }

    await createInvoice(invoice)

    await writeAuditLog({
      userId: session.userId,
      userRole: session.role || 'staff',
      action: 'CREATE',
      resourceType: 'invoice',
      resourceId: invoice.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }, request)

    return NextResponse.json({ invoice, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 })
  }
}
