'use client'

import { useState } from 'react'
import { Bell, Search, User, Sun, Moon, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'

export function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showLang, setShowLang] = useState(false)
  const { theme, setTheme } = useTheme()
  const { session } = useAuth()

  const userName = session?.name || 'User'
  const userRole = session?.role || (session?.userType === 'patient' ? 'Patient' : 'Staff')

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-4 lg:px-8 z-30 pt-12 lg:pt-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-xs lg:max-w-sm hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-lg bg-muted border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto lg:ml-8">
        {/* Language Switcher */}
        <div className="relative hidden sm:block">
          <button onClick={() => setShowLang(!showLang)} className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Switch language">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          </button>
          {showLang && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLang(false)} />
              <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
                {[
                  { code: 'en', label: '🇬🇧 English' },
                  { code: 'fr', label: '🇫🇷 Français' },
                  { code: 'ar', label: '🇸🇦 العربية' },
                ].map((lang) => (
                  <button key={lang.code} onClick={() => setShowLang(false)}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                    {lang.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
            <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-screen sm:w-80 sm:max-w-sm bg-card border border-border rounded-lg shadow-lg p-3 sm:p-4 top-full -mx-3 sm:mx-0 sm:rounded-lg">
              <h3 className="font-medium text-sm mb-3 text-foreground">Notifications</h3>
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded text-sm border border-border/50">
                  <p className="text-foreground font-medium text-xs">New appointment</p>
                  <p className="text-muted-foreground text-xs mt-1">John Doe requested appointment</p>
                </div>
                <div className="p-3 bg-muted rounded text-sm border border-border/50">
                  <p className="text-foreground font-medium text-xs">Prescription ready</p>
                  <p className="text-muted-foreground text-xs mt-1">Jane Smith&apos;s prescription is ready</p>
                </div>
              </div>
            </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-border pl-2 sm:pl-3 lg:pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs sm:text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
        </div>
      </div>
    </header>
  )
}
