import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { drugs } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'pharmacist')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await db.select().from(drugs).orderBy(drugs.name)
    return NextResponse.json({ drugs: result })
  } catch (error) {
    console.error('Drugs list error:', error)
    return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySessionToken(token)
    if (!session || (session.role !== 'admin' && session.role !== 'pharmacist')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const [drug] = await db.insert(drugs).values({
      name: body.name,
      quantity: body.quantity || 0,
      unit: body.unit || 'units',
      reorderLevel: body.reorderLevel || 50,
    }).returning()

    return NextResponse.json({ drug, success: true }, { status: 201 })
  } catch (error) {
    console.error('Create drug error:', error)
    return NextResponse.json({ error: 'Failed to create drug' }, { status: 500 })
  }
}
