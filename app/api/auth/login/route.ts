import { NextResponse } from 'next/server'
import { generateSecureOTP } from '@/lib/auth'
import { getPatientByEmail, getStaffByEmail, setOTP } from '@/lib/data'
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

    // Check patients via data layer (DB or JSON fallback)
    const patient = await getPatientByEmail(email)

    if (patient) {
      // Generate OTP and store with 5-minute expiry
      const otp = generateSecureOTP()
      await setOTP(email, otp, String(Date.now() + 5 * 60 * 1000))

      // Log OTP to server console only
      console.log(`[OTP for ${email}]: ${otp}`)

      return NextResponse.json({ userType: 'patient', step: 'otp' })
    }

    // Check staff via data layer (DB or JSON fallback)
    const staff = await getStaffByEmail(email)

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
