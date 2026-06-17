'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Plus, X, Send, CheckCircle } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { toast } from 'sonner'

interface DrugRow { drugName: string; dosage: string; frequency: string; duration: string }

export default function ConsultationPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const router = useRouter()
  const { session } = useAuth()
  const [apptId, setApptId] = useState('')
  const [appointment, setAppointment] = useState<any>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [drugs, setDrugs] = useState<DrugRow[]>([{ drugName: '', dosage: '', frequency: '', duration: '' }])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { params.then(({ appointmentId }) => setApptId(appointmentId)) }, [params])

  useEffect(() => {
    if (!apptId) return
    fetch('/api/appointments').then(r => r.ok && r.json()).then(d => {
      const found = (d.appointments || []).find((a: any) => a.id === apptId)
      if (found) setAppointment(found)
    }).catch(() => {})
  }, [apptId])

  const addDrug = () => setDrugs(prev => [...prev, { drugName: '', dosage: '', frequency: '', duration: '' }])
  const removeDrug = (i: number) => setDrugs(prev => prev.filter((_, idx) => idx !== i))
  const updateDrug = (i: number, field: keyof DrugRow, value: string) => {
    setDrugs(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const handleSendToPharmacy = async () => {
    if (!diagnosis) { toast.error('Please enter a diagnosis'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: appointment?.patientId,
          doctorId: session?.id,
          diagnosis,
          notes,
          drugs: drugs.filter(d => d.drugName && d.dosage),
        }),
      })
      if (res.ok) {
        toast.success('Prescription sent to pharmacy')
        await fetch(`/api/appointments/${apptId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'confirmed' }),
        })
        router.push('/doctor/dashboard')
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to send prescription')
      }
    } catch { toast.error('Failed to send prescription') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-semibold text-[--text-1]">Consultation</h1></div>
        <button onClick={() => router.push('/doctor/dashboard')} className="px-3 py-1.5 border border-[--border] rounded-lg text-[13px] hover:bg-[--surface-2]">Back to Dashboard</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-5">
        {/* Patient Summary */}
        <div className="bg-[--surface] border border-[--border] rounded-xl p-5 space-y-4">
          <h3 className="text-[13px] font-semibold text-[--text-1]">Patient Summary</h3>
          {appointment ? (
            <>
              <div><p className="text-[11px] text-[--text-3]">Name</p><p className="text-[13px] font-medium text-[--text-1]">{appointment.patientName || appointment.patientLastName || 'Unknown'}</p></div>
              <div><p className="text-[11px] text-[--text-3]">Type</p><p className="text-[13px] font-medium text-[--text-1]">{appointment.type}</p></div>
              <div><p className="text-[11px] text-[--text-3]">Status</p><StatusBadge status={appointment.status} /></div>
              {appointment.notes && <div><p className="text-[11px] text-[--text-3]">Notes</p><p className="text-[13px] text-[--text-2]">{appointment.notes}</p></div>}
            </>
          ) : (
            <p className="text-[13px] text-[--text-3]">Loading...</p>
          )}
        </div>

        {/* Consultation Form */}
        <div className="space-y-5">
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <h3 className="text-[13px] font-semibold text-[--text-1] mb-4">Consultation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[--text-2] mb-1">Diagnosis *</label>
                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" rows={3} required />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[--text-2] mb-1">Clinical Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[--surface-2] border border-[--border] text-[13px] focus:outline-none focus:ring-2 focus:ring-[--accent]" rows={3} />
              </div>
            </div>
          </div>

          {/* Prescription Builder */}
          <div className="bg-[--surface] border border-[--border] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-semibold text-[--text-1]">Prescription</h3>
              <button onClick={addDrug} className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[--accent] font-medium hover:bg-[--accent-soft] rounded-lg">
                <Plus className="w-3.5 h-3.5" /> Add Drug
              </button>
            </div>

            <div className="space-y-3">
              {drugs.map((drug, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-[--surface-2]">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                    <input placeholder="Drug Name" value={drug.drugName} onChange={e => updateDrug(i, 'drugName', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[--surface] border border-[--border] text-[12px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                    <input placeholder="Dosage" value={drug.dosage} onChange={e => updateDrug(i, 'dosage', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[--surface] border border-[--border] text-[12px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                    <input placeholder="Frequency" value={drug.frequency} onChange={e => updateDrug(i, 'frequency', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[--surface] border border-[--border] text-[12px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                    <input placeholder="Duration" value={drug.duration} onChange={e => updateDrug(i, 'duration', e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-[--surface] border border-[--border] text-[12px] focus:outline-none focus:ring-2 focus:ring-[--accent]" />
                  </div>
                  {drugs.length > 1 && (
                    <button onClick={() => removeDrug(i)} className="p-1 text-[--text-3] hover:text-[--danger]"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSendToPharmacy} disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 bg-[--accent] text-white rounded-lg text-[13px] font-medium hover:bg-[--accent-hover] transition-colors disabled:opacity-50">
                <Send className="w-4 h-4" /> Send to Pharmacy
              </button>
              <button onClick={async () => {
                try {
                  await fetch(`/api/appointments/${apptId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'confirmed' }),
                  })
                  toast.success('Consultation completed')
                  router.push('/doctor/dashboard')
                } catch { toast.error('Failed to complete consultation') }
              }}
                className="flex items-center gap-1.5 px-4 py-2 border border-[--border] text-[--text-2] rounded-lg text-[13px] font-medium hover:bg-[--surface-2]">
                <CheckCircle className="w-4 h-4" /> Complete Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
