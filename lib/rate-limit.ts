const attempts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= max) return false
  entry.count++
  return true
}

export function getRateLimitRemaining(key: string, max: number, windowMs: number): number {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now > entry.resetAt) return max
  return Math.max(0, max - entry.count)
}

// Clean up stale entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of attempts.entries()) {
      if (now > entry.resetAt) {
        attempts.delete(key)
      }
    }
  }, 60_000)
}
