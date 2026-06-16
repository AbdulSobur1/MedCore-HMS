import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
// Uses Edge-compatible auth utilities only

export async function GET() {
  try {
    const session = await getSessionFromCookie()

    if (!session) {
      return NextResponse.json({ error: 'No valid session' }, { status: 401 })
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Failed to check session' },
      { status: 500 }
    )
  }
}
