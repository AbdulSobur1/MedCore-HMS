'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface SessionPayload {
  userType: 'patient' | 'staff'
  userId: string
  email: string
  name: string
  role?: string
}

interface AuthContextType {
  session: SessionPayload | null
  isLoading: boolean
  login: (session: SessionPayload) => void
  logout: () => Promise<void>
  isPatient: boolean
  isStaff: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionPayload | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check session via API on mount
    async function checkSession() {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setSession(data.session)
        }
      } catch {
        // No valid session
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = (newSession: SessionPayload) => {
    setSession(newSession)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Logout failed on server, but clear state anyway
    }
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        isPatient: session?.userType === 'patient',
        isStaff: session?.userType === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
