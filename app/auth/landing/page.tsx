'use client'

import Link from 'next/link'
import { ArrowRight, Users, Calendar, Pill, BarChart3, Lock, ClipboardList, Stethoscope } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-foreground">MedCore</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Hospital Management System</p>
            </div>
          </div>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-foreground">
                Hospital Management Reimagined
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                A comprehensive platform designed to streamline patient care, coordinate staff operations, and optimize hospital workflows. From appointment scheduling to pharmacy management, everything your hospital needs.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Patient-centric care management</p>
                  <p className="text-xs text-muted-foreground">Comprehensive medical records and history</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Smart appointment scheduling</p>
                  <p className="text-xs text-muted-foreground">Efficient booking and management system</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Pill className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Pharmacy management</p>
                  <p className="text-xs text-muted-foreground">Prescription and inventory tracking</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Secure & compliant</p>
                  <p className="text-xs text-muted-foreground">Enterprise-grade data protection</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors text-sm"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Column - Features Grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Patient Profiles</h4>
              <p className="text-xs text-muted-foreground">Complete medical records and history</p>
            </div>

            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Appointments</h4>
              <p className="text-xs text-muted-foreground">Scheduling and management</p>
            </div>

            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Pharmacy</h4>
              <p className="text-xs text-muted-foreground">Prescriptions and inventory</p>
            </div>

            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Analytics</h4>
              <p className="text-xs text-muted-foreground">Real-time reports and insights</p>
            </div>

            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Billing</h4>
              <p className="text-xs text-muted-foreground">Invoice and payment tracking</p>
            </div>

            <div className="space-y-3 p-4 sm:p-6 glass">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold text-sm text-foreground">Security</h4>
              <p className="text-xs text-muted-foreground">Enterprise-grade protection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            MedCore - Advanced Hospital Management System
          </p>
        </div>
      </footer>
    </div>
  )
}
