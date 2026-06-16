import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { cookies } from 'next/headers'

// Re-export password functions from separate file (avoids bcryptjs in Edge Runtime)
export { hashPassword, verifyPassword } from './auth-passwords'

// Auth types
export type UserRole = 'patient' | 'doctor' | 'pharmacist' | 'receptionist' | 'accountant' | 'admin'

export interface PatientProfile {
  patientId: string
  email: string
  name: string
  phone: string
  dateOfBirth: string
  gender: 'M' | 'F' | 'Other'
  bloodType: string
  address?: string
  emergencyContact?: string
  passwordHash?: string
  createdAt: string
}

export interface StaffProfile {
  staffId: string
  email: string
  name: string
  role: Exclude<UserRole, 'patient'>
  phone?: string
  department?: string
  passwordHash?: string
  createdAt: string
  invitedAt?: string
  acceptedAt?: string
  isActive: boolean
}

export interface Session {
  userType: 'patient' | 'staff'
  userId: string
  email: string
  name: string
  role?: UserRole
  token: string
  expiresAt: number
}

export interface AuthJWTPayload extends JWTPayload {
  userType: 'patient' | 'staff'
  userId: string
  email: string
  name: string
  role?: UserRole
}

// Generate unique IDs
export function generatePatientId(): string {
  return `PAT-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function generateStaffId(): string {
  return `STAFF-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export function generateInviteToken(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}

export function generateSecureOTP(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 900000 + 100000)
}

export function generateOTP(): string {
  return generateSecureOTP()
}

// JWT session management
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(payload: AuthJWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJWTSecret())
}

export async function verifySessionToken(token: string): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret())
    return payload as unknown as AuthJWTPayload
  } catch {
    return null
  }
}

export function createSession(data: Omit<Session, 'expiresAt'>): Session {
  return {
    ...data,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }
}

export function isSessionValid(session: Session | null): boolean {
  if (!session) return false
  return Date.now() < session.expiresAt
}

// Legacy localStorage methods (kept for backward compatibility)
export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const session = localStorage.getItem('medcore_session')
  if (!session) return null
  try {
    const parsed = JSON.parse(session)
    return isSessionValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setSession(session: Session): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('medcore_session', JSON.stringify(session))
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('medcore_session')
}

// Server-side session from httpOnly cookie
export async function getSessionFromCookie(): Promise<AuthJWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    if (!token) return null
    return verifySessionToken(token)
  } catch {
    return null
  }
}
