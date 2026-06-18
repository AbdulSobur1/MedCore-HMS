'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loader } from 'lucide-react'
import { ROLE_HOME } from '@/lib/auth'

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
      // Show landing page for unauthenticated users
      router.push('/auth/landing')
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
