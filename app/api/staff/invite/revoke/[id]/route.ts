import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staffInvites } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function DELETE(
  _request: Request,
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
    await db.delete(staffInvites).where(eq(staffInvites.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke invite error:', error)
    return NextResponse.json({ error: 'Failed to revoke invite' }, { status: 500 })
  }
}
