import { NextResponse } from 'next/server'
import { verifyPassword, createSessionToken } from '@/lib/auth'
import { readDataFile } from '@/lib/data'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Look up staff
    const staffProfiles = await readDataFile<Record<string, any>>('staff.json')
    const staff = Object.values(staffProfiles).find((s: any) => s.email === email)

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      )
    }

    if (!staff.passwordHash) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, staff.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Create JWT session
    const token = await createSessionToken({
      userType: 'staff',
      userId: staff.staffId,
      email: staff.email,
      name: staff.name,
      role: staff.role,
    })

    // Set httpOnly cookie
    const response = NextResponse.json({ success: true, role: staff.role })
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Password login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
