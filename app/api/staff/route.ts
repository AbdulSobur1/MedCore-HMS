import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { staff } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await db.select({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      department: staff.department,
      phone: staff.phone,
      isActive: staff.isActive,
      lastLogin: staff.lastLogin,
      createdAt: staff.createdAt,
    }).from(staff).orderBy(staff.createdAt)

    return NextResponse.json({ staff: result })
  } catch (error) {
    console.error('Staff list error:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}
