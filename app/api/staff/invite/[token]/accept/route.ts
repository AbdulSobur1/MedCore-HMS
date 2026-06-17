import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff, staffInvites } from '@/lib/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()
    const data = schema.parse(body)

    // Validate token
    const invite = await db.select()
      .from(staffInvites)
      .where(and(
        eq(staffInvites.token, token),
        isNull(staffInvites.usedAt),
        gt(staffInvites.expiresAt, new Date())
      ))
      .limit(1)

    if (invite.length === 0) {
      return NextResponse.json(
        { error: 'This invite link is invalid or has expired.' },
        { status: 400 }
      )
    }

    const inv = invite[0]

    // Hash password and create staff
    const passwordHash = await bcrypt.hash(data.password, 10)

    await db.insert(staff).values({
      name: data.name,
      email: inv.email,
      passwordHash,
      role: inv.role,
      department: inv.department,
    })

    // Mark invite as used
    await db.update(staffInvites)
      .set({ usedAt: new Date() })
      .where(eq(staffInvites.id, inv.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Invite accept error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
