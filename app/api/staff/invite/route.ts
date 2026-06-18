import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff, staffInvites } from '@/lib/schema'
import { eq, and, isNull, gt, desc } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

const STAFF_ROLES = ['doctor', 'receptionist', 'pharmacist', 'accountant'] as const

async function requireAdmin() {
  const cookieHeader = await import('next/headers').then(m => m.cookies())
  const token = cookieHeader.get('session')?.value
  if (!token) return null

  const session = await verifySessionToken(token)
  return session?.role === 'admin' ? session : null
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const result = await db.select({
      id: staffInvites.id,
      email: staffInvites.email,
      role: staffInvites.role,
      department: staffInvites.department,
      token: staffInvites.token,
      usedAt: staffInvites.usedAt,
      expiresAt: staffInvites.expiresAt,
      createdAt: staffInvites.createdAt,
    }).from(staffInvites)
      .where(and(isNull(staffInvites.usedAt), gt(staffInvites.expiresAt, new Date())))
      .orderBy(desc(staffInvites.createdAt))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.json({
      invites: result.map(invite => ({
        ...invite,
        inviteUrl: `${appUrl}/auth/invite/${invite.token}`,
      })),
    })
  } catch (error) {
    console.error('Invites list error:', error)
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, role, department } = await request.json()
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }
    if (!STAFF_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid staff role' }, { status: 400 })
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
