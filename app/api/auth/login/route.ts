import { NextResponse } from 'next/server'
import { generateSecureOTP } from '@/lib/auth'
import { readDataFile, writeDataFile } from '@/lib/data'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Rate limiting: max 5 attempts per email per 15 minutes
    if (!checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Check patients
    const patients = await readDataFile<Record<string, any>>('patients.json')
    const patient = Object.values(patients).find((p: any) => p.email === email)

    if (patient) {
      // Generate OTP and store with 5-minute expiry
      const otp = generateSecureOTP()
      const otps = await readDataFile<Record<string, any>>('otps.json')
      otps[email] = {
        code: otp,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      }
      await writeDataFile('otps.json', otps)

      // Log OTP to server console only
      console.log(`[OTP for ${email}]: ${otp}`)

      return NextResponse.json({ userType: 'patient', step: 'otp' })
    }

    // Check staff
    const staffProfiles = await readDataFile<Record<string, any>>('staff.json')
    const staff = Object.values(staffProfiles).find((s: any) => s.email === email)

    if (staff) {
      return NextResponse.json({ userType: 'staff', step: 'password' })
    }

    return NextResponse.json(
      { error: 'Email not found. Please register first.' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
