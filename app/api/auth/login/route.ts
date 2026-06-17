import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { staff, patients } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { createSessionToken, ROLE_HOME } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // 1. Look up in staff table first
    const staffResult = await db.select().from(staff).where(eq(staff.email, email)).limit(1)
    if (staffResult.length > 0) {
      const s = staffResult[0]
      const valid = await bcrypt.compare(password, s.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
      }

      // Update lastLogin
      await db.update(staff).set({ lastLogin: new Date() }).where(eq(staff.id, s.id))

      const token = await createSessionToken({
        id: s.id,
        email: s.email,
        name: s.name,
        role: s.role,
        type: 'staff',
      })

      const redirect = ROLE_HOME[s.role] || '/staff/dashboard'

      const response = NextResponse.json({ success: true, role: s.role, redirect })
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return response
    }

    // 2. Look up in patients table
    const patientResult = await db.select().from(patients).where(eq(patients.email, email)).limit(1)
    if (patientResult.length > 0) {
      const p = patientResult[0]
      const valid = await bcrypt.compare(password, p.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 })
      }

      const token = await createSessionToken({
        id: p.id,
        email: p.email,
        name: `${p.firstName} ${p.lastName}`,
        role: 'patient',
        type: 'patient',
      })

      const response = NextResponse.json({ success: true, role: 'patient', redirect: '/patient/dashboard' })
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return response
    }

    // 3. Not found
    return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
