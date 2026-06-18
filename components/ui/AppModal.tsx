'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface AppModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
}

export function AppModal({ title, children, onClose, size = 'md' }: AppModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-y-auto rounded-xl border border-[--border] bg-[--surface] p-6 shadow-2xl`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="app-modal-title" className="text-[15px] font-semibold text-[--text-1]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[--text-3] transition-colors hover:bg-[--surface-2] hover:text-[--text-1]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
