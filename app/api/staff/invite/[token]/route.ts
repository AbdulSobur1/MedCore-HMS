import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staffInvites } from '@/lib/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const result = await db.select()
      .from(staffInvites)
      .where(and(
        eq(staffInvites.token, token),
        isNull(staffInvites.usedAt),
        gt(staffInvites.expiresAt, new Date())
      ))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'This invite link is invalid or has expired.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      invite: {
        email: result[0].email,
        role: result[0].role,
        department: result[0].department,
      }
    })
  } catch (error) {
    console.error('Invite validation error:', error)
    return NextResponse.json({ error: 'Failed to validate invite' }, { status: 500 })
  }
}
