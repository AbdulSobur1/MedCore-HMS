'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Loader, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please enter your email and password')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Get session to update auth context
      const sessionRes = await fetch('/api/auth/session')
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        if (sessionData.session) {
          login(sessionData.session)
        }
      }

      toast.success(`Welcome back!`)
      router.push(data.redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[--accent] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-[--text-1]">MedCore HMS</span>
        </div>

        {/* Card */}
        <div className="bg-[--surface] rounded-2xl border border-[--border] p-8">
          <div className="space-y-1 mb-8">
            <h1 className="text-2xl font-semibold text-[--text-1]">Welcome back</h1>
            <p className="text-sm text-[--text-3]">Sign in to your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[--danger-soft] border border-[--danger]/20 rounded-lg text-sm text-[--danger]">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center text-sm">
            <p className="text-[--text-3]">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-[--accent] font-medium hover:underline">
                Register as a patient
              </Link>
            </p>
            <p className="text-[--text-3] text-xs">
              Staff? Request an invite from your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
