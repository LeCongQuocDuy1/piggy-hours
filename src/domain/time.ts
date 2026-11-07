import { err, ok, type Result } from './types'

export const MAX_MINUTES_PER_PART = 59

/** `90` becomes `1h 30m`, `60` becomes `1h 0m`, `45` becomes `0h 45m` (BR-02). */
export function formatMinutes(total: number): string {
  const safe = Math.max(0, Math.floor(total))
  return `${Math.floor(safe / 60)}h ${safe % 60}m`
}

/** Compact form used in tight places: `90` becomes `1h 30m`, `120` becomes `2h`, `45` becomes `45m`. */
export function formatMinutesShort(total: number): string {
  const safe = Math.max(0, Math.floor(total))
  const h = Math.floor(safe / 60)
  const m = safe % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export type DurationError = 'NOT_A_NUMBER' | 'NEGATIVE' | 'MINUTES_TOO_LARGE' | 'ZERO'

const WHOLE_NUMBER = /^\d+$/

/**
 * Turns the two text fields of the time form into whole minutes. A blank field counts as 0, decimals and
 * negative numbers are rejected, minutes must be 0 to 59, and the total must be greater than 0.
 */
export function parseDuration(
  hours: string,
  minutes: string,
): Result<number, DurationError> {
  const h = hours.trim()
  const m = minutes.trim()
  for (const part of [h, m]) {
    if (part.startsWith('-')) return err('NEGATIVE')
    if (part !== '' && !WHOLE_NUMBER.test(part)) return err('NOT_A_NUMBER')
  }
  const hh = h === '' ? 0 : Number(h)
  const mm = m === '' ? 0 : Number(m)
  if (mm > MAX_MINUTES_PER_PART) return err('MINUTES_TOO_LARGE')
  const total = hh * 60 + mm
  if (total <= 0) return err('ZERO')
  return ok(total)
}

/** Local calendar date as `YYYY-MM-DD` (BR-07). The clock is passed in so callers and tests control "now". */
export function toLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** True for real calendar dates written as `YYYY-MM-DD` (rejects `2026-02-30`). */
export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}
