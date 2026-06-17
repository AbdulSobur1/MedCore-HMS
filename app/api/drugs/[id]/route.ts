import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { drugs } from '@/lib/schema'
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
    if (!session || (session.role !== 'admin' && session.role !== 'pharmacist')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    await db.update(drugs).set({ ...body, updatedAt: new Date() }).where(eq(drugs.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Drug update error:', error)
    return NextResponse.json({ error: 'Failed to update drug' }, { status: 500 })
  }
}
