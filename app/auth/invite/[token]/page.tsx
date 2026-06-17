'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Loader, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [invite, setInvite] = useState<{ email: string; role: string; department?: string } | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    params.then(({ token: t }) => {
      setToken(t)
      validateToken(t)
    })
  }, [params])

  const validateToken = async (t: string) => {
    try {
      const res = await fetch(`/api/staff/invite/${t}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'This invite link is invalid or has expired.')
        return
      }
      const data = await res.json()
      setInvite(data.invite)
    } catch {
      setError('This invite link is invalid or has expired. Please ask your administrator for a new invite.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (!name || !password) {
        throw new Error('Please fill in all fields')
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const res = await fetch(`/api/staff/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(true)
      toast.success('Account created! You can now log in.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <Loader className="w-8 h-8 animate-spin text-[--accent]" />
      </div>
    )
  }

  if (error && !invite) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[--surface] rounded-2xl border border-[--border] p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[--danger-soft] flex items-center justify-center mb-6">
            <AlertTriangle className="w-7 h-7 text-[--danger]" />
          </div>
          <h2 className="text-xl font-semibold text-[--text-1] mb-2">Invalid Invite</h2>
          <p className="text-sm text-[--text-3] mb-6">{error}</p>
          <Link href="/auth/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[--surface] rounded-2xl border border-[--border] p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[--success-soft] flex items-center justify-center mb-6">
            <CheckCircle className="w-7 h-7 text-[--success]" />
          </div>
          <h2 className="text-xl font-semibold text-[--text-1] mb-2">Account created!</h2>
          <p className="text-sm text-[--text-3] mb-6">You can now log in.</p>
          <Link href="/auth/login"
            className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[--accent] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-[--text-1]">MedCore HMS</span>
        </div>

        <div className="bg-[--surface] rounded-2xl border border-[--border] p-8">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-semibold text-[--text-1]">Complete your account</h1>
            <p className="text-sm text-[--text-3]">Set up your staff account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[--danger-soft] border border-[--danger]/20 rounded-lg text-sm text-[--danger]">{error}</div>
            )}

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Email</label>
              <input type="email" value={invite?.email || ''} readOnly
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] opacity-60 cursor-not-allowed" />
            </div>

            {invite?.role && (
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Role</label>
                <span className="inline-block px-3 py-1.5 rounded-lg bg-[--accent-soft] text-[--accent] text-sm font-medium capitalize">
                  {invite.role}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Full Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent"
                required />
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent"
                  required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent"
                  required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
