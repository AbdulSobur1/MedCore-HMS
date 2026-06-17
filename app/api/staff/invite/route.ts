import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff, staffInvites } from '@/lib/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, role, department } = await request.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Check not already staff
    const existingStaff = await db.select().from(staff).where(eq(staff.email, email)).limit(1)
    if (existingStaff.length > 0) {
      return NextResponse.json({ error: 'This email is already registered as staff.' }, { status: 409 })
    }

    // Check no pending invite
    const existingInvite = await db.select()
      .from(staffInvites)
      .where(and(
        eq(staffInvites.email, email),
        isNull(staffInvites.usedAt),
        gt(staffInvites.expiresAt, new Date())
      ))
      .limit(1)

    if (existingInvite.length > 0) {
      return NextResponse.json({ error: 'A pending invite already exists for this email.' }, { status: 409 })
    }

    const inviteToken = randomUUID()
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours

    await db.insert(staffInvites).values({
      email,
      role,
      department: department || null,
      token: inviteToken,
      expiresAt,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${appUrl}/auth/invite/${inviteToken}`

    console.log('STAFF INVITE LINK:', inviteUrl)

    return NextResponse.json({ success: true, inviteUrl })
  } catch (error) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
  }
}
