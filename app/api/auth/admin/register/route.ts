import { NextResponse } from 'next/server'
import { hashPassword, generateStaffId } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const { key, name, email, password } = await request.json()

    // Validate admin key
    const adminKey = process.env.ADMIN_KEY
    if (!adminKey) {
      return NextResponse.json(
        { error: 'ADMIN_KEY not configured on server' },
        { status: 500 }
      )
    }

    if (key !== adminKey) {
      return NextResponse.json(
        { error: 'Invalid admin key. Access denied.' },
        { status: 403 }
      )
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const staffProfiles = await readDataFile<Record<string, any>>('staff.json')
    const emailExists = Object.values(staffProfiles).some(
      (s: any) => s.email === email
    )
    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create admin profile
    const staffId = generateStaffId()
    const newAdmin = {
      staffId,
      email,
      name,
      role: 'admin' as const,
      passwordHash,
      department: 'Administration',
      phone: '',
      createdAt: new Date().toISOString(),
      isActive: true,
    }

    staffProfiles[staffId] = newAdmin
    await writeDataFile('staff.json', staffProfiles)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
