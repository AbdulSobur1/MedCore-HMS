import { NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function GET() {
  try {
    const cookieHeader = await import('next/headers').then(m => m.cookies())
    const token = cookieHeader.get('session')?.value

    if (!token) {
      return NextResponse.json({ error: 'No session' }, { status: 401 })
    }

    const session = await verifySessionToken(token)
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    return NextResponse.json({
      session: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        type: session.type,
      }
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ error: 'Failed to check session' }, { status: 500 })
  }
}
