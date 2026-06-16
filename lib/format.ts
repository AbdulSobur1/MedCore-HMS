export function formatDate(dateStr: string, timezone: string = 'UTC', locale: string = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function formatTime(dateStr: string, timezone: string = 'UTC', locale: string = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDateShort(dateStr: string, timezone: string = 'UTC', locale: string = 'en-US') {
  return new Intl.DateTimeFormat(locale, {
    timeZone: timezone,
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr))
}

// Default settings
export const DEFAULT_SETTINGS = {
  hospitalName: 'MedCore Hospital',
  email: 'admin@medcore.hospital',
  phone: '',
  currency: 'USD',
  locale: 'en-US',
  timezone: 'UTC',
  notifications: { email: true, sms: true },
  maintenanceMode: false,
  twoFactor: true,
}
