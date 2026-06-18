'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Stethoscope, Loader, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type Step = 'form' | 'success'

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: '', color: '', width: '0%' }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { label: 'Weak', color: 'bg-[--danger]', width: '25%' }
  if (score <= 4) return { label: 'Fair', color: 'bg-[--warning]', width: '50%' }
  if (score <= 5) return { label: 'Good', color: 'bg-[--info]', width: '75%' }
  return { label: 'Strong', color: 'bg-[--success]', width: '100%' }
}

const INSURANCE_OPTIONS = [
  'HealthPlus HMO',
  'Reliance HMO',
  'Hygeia HMO',
  'AXA Mansard',
  'Leadway Health',
  'Total Health Trust',
  'Clearline HMO',
  'Private / Self',
  'NHIS',
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientCode, setPatientCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
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

  const passwordStrength = getPasswordStrength(form.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName': return !value ? 'First name is required' : ''
      case 'lastName': return !value ? 'Last name is required' : ''
      case 'email': return !value ? 'Email is required' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email address' : ''
      case 'phone': return !value ? 'Phone is required' : !/^\+?[0-9\-\s]{7,20}$/.test(value) ? 'Enter a valid phone number (e.g. +234-800-000-0000)' : ''
      case 'dob': return !value ? 'Date of birth is required' : !/^\d{2}\/\d{2}\/\d{4}$/.test(value) ? 'Use dd/mm/yyyy format' : ''
      case 'password': return !value ? 'Password is required' : value.length < 8 ? 'At least 8 characters required' : ''
      case 'confirmPassword': return !value ? 'Please confirm your password' : value !== form.password ? 'Passwords do not match' : ''
      default: return ''
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const err = validateField(name, value)
    if (err) {
      setFieldErrors(prev => ({ ...prev, [name]: err }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all fields
    const errors: Record<string, string> = {}
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dob', 'password', 'confirmPassword']
    for (const field of fieldsToValidate) {
      const err = validateField(field, (form as any)[field])
      if (err) errors[field] = err
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    try {
      // Convert dd/mm/yyyy to ISO date string for the API
      const [d, m, y] = form.dob.split('/')
      const isoDob = `${y}-${m}-${d}`

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, dob: isoDob }),
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4"
           style={{background: 'linear-gradient(135deg, #f0fdfa 0%, #e6f4f2 40%, #eff8ff 100%)'}}>
        <div className="w-full max-w-md">
          <Link href="/auth/landing" className="flex items-center gap-1.5 text-sm text-[--text-2] hover:text-[--text-1] mb-6 transition-colors">
            ← Back to home
          </Link>
          <div className="glass rounded-2xl p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[--success-soft] flex items-center justify-center mb-6">
              <CheckCircle className="w-7 h-7 text-[--success]" />
            </div>
            <h2 className="text-xl font-semibold text-[--text-1] mb-2">Account created!</h2>
            <p className="text-sm text-[--text-3] mb-4">Your Patient ID:</p>
            <p className="text-2xl font-bold text-[--accent] font-mono mb-2">{patientCode}</p>
            <p className="text-xs text-[--text-3] mb-8">Keep this safe for your records.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-[#0D7A6B] text-white rounded-lg font-semibold text-sm hover:-translate-y-[1px] active:translate-y-0 transition-all"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-8"
         style={{background: 'linear-gradient(135deg, #f0fdfa 0%, #e6f4f2 40%, #eff8ff 100%)'}}>
      <div className="w-full max-w-lg">
        <Link href="/auth/landing" className="flex items-center gap-1.5 text-sm text-[--text-2] hover:text-[--text-1] mb-6 transition-colors">
          ← Back to home
        </Link>
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#0D7A6B] flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-semibold text-[--text-1]">MedCore HMS</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-semibold text-[--text-1]">Create your patient account</h1>
            <p className="text-sm text-[--text-3]">Fill in your details to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error message — reserve space */}
            <div className="min-h-[44px]">
              {error ? (
                <div className="p-3 bg-[--danger-soft] border border-[--danger]/20 rounded-lg text-sm text-[--danger] animate-in fade-in">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.firstName ? 'border-[--danger]' : 'border-[--border]'}`} required />
                {fieldErrors.firstName && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.lastName ? 'border-[--danger]' : 'border-[--border]'}`} required />
                {fieldErrors.lastName && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.lastName}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Email *</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.email ? 'border-[--danger]' : 'border-[--border]'}`} required />
                {fieldErrors.email && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Phone *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} onBlur={handleBlur}
                  placeholder="+234-800-000-0000"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.phone ? 'border-[--danger]' : 'border-[--border]'}`} required />
                <p className="text-[11px] text-[--text-3] mt-1">Format: +234-XXX-XXX-XXXX</p>
                {fieldErrors.phone && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Date of Birth *</label>
                <input type="text" name="dob" value={form.dob} onChange={handleChange} onBlur={handleBlur}
                  placeholder="dd/mm/yyyy"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.dob ? 'border-[--danger]' : 'border-[--border]'}`} required />
                <p className="text-[11px] text-[--text-3] mt-1">Format: dd/mm/yyyy (e.g. 15/08/1990)</p>
                {fieldErrors.dob && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.dob}</p>}
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
              <select name="insurance" value={form.insurance} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-[--surface-2] border border-[--border] text-sm text-[--text-1] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent">
                <option value="">Select HMO provider</option>
                {INSURANCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Min. 8 characters"
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.password ? 'border-[--danger]' : 'border-[--border]'}`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.password}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[--text-2] mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                    placeholder="Re-enter password"
                    className={`w-full px-3 py-2.5 pr-10 rounded-lg bg-[--surface-2] border text-sm text-[--text-1] placeholder:text-[--text-3] focus:outline-none focus:ring-2 focus:ring-[--accent] focus:border-transparent transition-colors ${fieldErrors.confirmPassword ? 'border-[--danger]' : 'border-[--border]'}`} required />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-3] hover:text-[--text-2]">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="text-[11px] text-[--danger] mt-1">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="-mt-2">
                <div className="h-1.5 w-full bg-[--surface-2] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
                <p className="text-[11px] text-[--text-3] mt-1">
                  Password strength: <span className="font-medium">{passwordStrength.label || '—'}</span>
                </p>
                <ul className="text-[11px] text-[--text-3] mt-1 space-y-0.5 list-disc list-inside">
                  <li className={form.password.length >= 8 ? 'text-[--success]' : ''}>At least 8 characters</li>
                  <li className={/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 'text-[--success]' : ''}>Upper &amp; lowercase letters</li>
                  <li className={/[0-9]/.test(form.password) ? 'text-[--success]' : ''}>At least one number</li>
                  <li className={/[^A-Za-z0-9]/.test(form.password) ? 'text-[--success]' : ''}>At least one special character</li>
                </ul>
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#0D7A6B] text-white rounded-lg font-semibold text-sm hover:-translate-y-[1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 flex items-center justify-center gap-2">
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
