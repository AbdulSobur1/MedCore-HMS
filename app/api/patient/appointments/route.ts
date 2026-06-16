import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await readDataFile<any[]>('appointments.json')
    const patientAppointments = appointments.filter(
      (apt: any) => apt.patientId === session.userId
    )

    return NextResponse.json({ appointments: patientAppointments })
  } catch (error) {
    console.error('Patient appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}
