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
    const staffList = Object.values(staff) as any[]

    const departments: Record<string, { staff: number; patients: number }> = {}
    for (const s of staffList) {
      const dept = s.department || 'General'
      if (!departments[dept]) {
        departments[dept] = { staff: 0, patients: Math.round(Math.random() * 300 + 100) }
      }
      departments[dept].staff++
    }

    const data = Object.entries(departments).map(([name, info]) => ({
      name,
      value: info.patients,
      staff: info.staff,
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Department report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
