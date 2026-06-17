'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader } from 'lucide-react'

const ROLE_HOME: Record<string, string> = {
  admin:        '/admin/dashboard',
  doctor:       '/doctor/dashboard',
  receptionist: '/receptionist/dashboard',
  pharmacist:   '/pharmacist/dashboard',
  accountant:   '/accountant/dashboard',
  patient:      '/patient/dashboard',
}

export default function Home() {
  const router = useRouter()
  const { session, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (session) {
      const redirect = ROLE_HOME[session.role]
      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/auth/login')
      }
    } else {
      router.push('/auth/login')
    }
  }, [session, isLoading, router])

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-[--accent]" />
        <p className="text-[--text-3] text-sm">Loading...</p>
      </div>
    </div>
  )
}
