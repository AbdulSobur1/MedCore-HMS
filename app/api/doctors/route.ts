import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getDoctors } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const doctors = await getDoctors()

    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Doctors list error:', error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}
