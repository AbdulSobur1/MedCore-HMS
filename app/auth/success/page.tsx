'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Copy, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get('patientId') || ''
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (patientId) {
      navigator.clipboard.writeText(patientId)
      setCopied(true)
      toast.success('Patient ID copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>

        <h1 className="text-3xl font-light tracking-tight text-foreground mb-2">
          Registration Successful
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Your patient account has been created
        </p>

        <div className="bg-muted border border-border rounded-lg p-4 mb-8">
          <p className="text-xs text-muted-foreground mb-2">Your Patient ID</p>
          <p className="text-lg font-mono font-bold text-foreground break-all">{patientId}</p>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          Please save your Patient ID. You&apos;ll use your email to login.
        </p>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
        >
          Go to Login <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
