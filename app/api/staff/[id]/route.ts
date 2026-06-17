import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff } from '@/lib/schema'
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
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    await db.update(staff).set(body).where(eq(staff.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 })
  }
}
