import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staff = await readDataFile<Record<string, any>>('staff.json')
    const doctors = Object.values(staff).filter((s: any) => s.role === 'doctor')

    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Doctors list error:', error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}
