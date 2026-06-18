'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Stethoscope, Loader, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate sending — in production, hit your API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[--bg] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/auth/landing"
          className="flex items-center gap-1.5 text-sm text-[--text-2] hover:text-[--text-1] mb-6 transition-colors"
        >
          ← Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-[#0D7A6B] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-[--text-1]">MedCore HMS</span>
        </div>

        {/* Card */}
        <div className="bg-[--surface] rounded-2xl border border-[--border] p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-[--success-soft] flex items-center justify-center mb-6">
                <CheckCircle className="w-7 h-7 text-[--success]" />
              </div>
              <h2 className="text-xl font-semibold text-[--text-1] mb-2">Check your inbox</h2>
              <p className="text-sm text-[--text-3] mb-6">
                If an account exists for <strong className="text-[--text-1]">{email}</strong>, we&apos;ve sent password reset instructions.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0D7A6B] text-white rounded-lg font-semibold text-sm hover:-translate-y-[1px] active:translate-y-0 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl font-semibold text-[--text-1]">Forgot password</h1>
                <p className="text-sm text-[--text-3]">
                  Enter your email and we&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Error */}
                <div className="min-h-[44px]">
                  {error ? (
                    <div className="p-3 bg-[--danger-soft] border border-[--danger]/20 rounded-lg text-sm text-[--danger]">
                      {error}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[--text-2] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-3]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0D7A6B] text-white rounded-lg font-semibold text-sm hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/auth/login" className="text-sm text-[--accent] font-medium hover:underline">
                  ← Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
