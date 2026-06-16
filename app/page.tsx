'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (session) {
      if (session.userType === 'patient') {
        router.push('/patient/dashboard')
      } else if (session.userType === 'staff') {
        router.push('/staff/dashboard')
      }
    } else {
      router.push('/auth/landing')
    }
  }, [session, isLoading, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
