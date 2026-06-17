'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'form' | 'success'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientCode, setPatientCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodType: '',
    address: '',
    emergencyContact: '',
    insurance: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.dob || !form.password) {
        throw new Error('Please fill in all required fields')
      }
      if (form.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }
      if (form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setPatientCode(data.patientCode)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[--surface] rounded-2xl border border-[--border] p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[--success-soft] flex items-center justify-center mb-6">
              <CheckCircle className="w-7 h-7 text-[--success]" />
            </div>
            <h2 className="text-xl font-semibold text-[--text-1] mb-2">Account created!</h2>
            <p className="text-sm text-[--text-3] mb-4">Your Patient ID:</p>
            <p className="text-2xl font-bold text-[--accent] font-mono mb-2">{patientCode}</p>
            <p className="text-xs text-[--text-3] mb-8">Keep this safe for your records.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[--bg] flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[--accent] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-[--text-1]">MedCore HMS</span>
        </div>

        {/* Card */}
        <div className="bg-[--surface] rounded-2xl border border-[--border] p-8">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-semibold text-[--text-1]">Create your patient account</h1>
            <p className="text-sm text-[--text-3]">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[--danger-soft] border border-[--danger]/20 rounded-lg text-sm text-[--danger]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Phone *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Date of Birth *</label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Blood Type</label>
                <select name="bloodType" value={form.bloodType} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent">
                  <option value="">Select</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Emergency Contact</label>
                <input type="text" name="emergencyContact" value={form.emergencyContact} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[--text-2] mb-1.5">Insurance / HMO</label>
              <input type="text" name="insurance" value={form.insurance} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent" required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[--accent] text-white rounded-lg font-medium text-sm hover:bg-[--accent-hover] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[--text-3] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[--accent] font-medium hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
