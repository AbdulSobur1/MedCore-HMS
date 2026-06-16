import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appointments = await readDataFile<any[]>('appointments.json')
    const completedCount = appointments.filter((a) => a.status === 'Completed').length
    const totalCount = appointments.length

    const operationsData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((name, i) => ({
      name,
      surgeries: Math.round((totalCount || 50) * (0.2 + i * 0.05)),
      emergencies: Math.round((totalCount || 30) * (0.12 + i * 0.03)),
      procedures: Math.round((totalCount || 80) * (0.3 + i * 0.08)),
    }))

    return NextResponse.json({ data: operationsData })
  } catch (error) {
    console.error('Operations report error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
