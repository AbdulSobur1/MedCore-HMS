import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getPatientAppointments } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await getPatientAppointments(session.userId)

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Patient appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
