import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getPatientById } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const patient = await getPatientById(session.userId)

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Patient profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
