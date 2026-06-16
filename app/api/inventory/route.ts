import { NextResponse } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth'
import { getInventory } from '@/lib/data'

export async function GET() {
  try {
    const session = await getSessionFromCookie()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const inventory = await getInventory()
    return NextResponse.json({ inventory })
  } catch (error) {
    console.error('Inventory list error:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
