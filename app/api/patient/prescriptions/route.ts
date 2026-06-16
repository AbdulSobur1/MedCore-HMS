import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session || session.userType !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prescriptions = await readDataFile<any[]>('prescriptions.json')
    const patientPrescriptions = prescriptions.filter(
      (rx: any) => rx.patientId === session.userId
    )

    return NextResponse.json({ prescriptions: patientPrescriptions })
  } catch (error) {
    console.error('Patient prescriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    )
  }
}
