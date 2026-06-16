import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const patients = await readDataFile<Record<string, any>>('patients.json')
    const patient = patients[id]

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
    }

    return NextResponse.json({ patient })
  } catch (error) {
    console.error('Patient detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 })
  }
}
