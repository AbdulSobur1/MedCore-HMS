import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifySessionToken, type AuthJWTPayload, type UserRole } from '@/lib/auth'

export async function getSession(): Promise<AuthJWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  return token ? verifySessionToken(token) : null
}

export function requireRoles(
  session: AuthJWTPayload | null,
  roles: UserRole[]
): session is AuthJWTPayload {
  return !!session && roles.includes(session.role)
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export function pickDefined<T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Partial<Pick<T, K>> {
  const result: Partial<Pick<T, K>> = {}
  for (const key of keys) {
    if (source[key] !== undefined) result[key] = source[key]
  }
  return result
}

export async function requestFingerprint() {
  const headerStore = await headers()
  return (
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown'
  )
}
