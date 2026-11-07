import type { Deposit } from './types'

/** Total minutes saved per local date (`YYYY-MM-DD`), across all pigs, including completed ones. */
export type DailyTotals = ReadonlyMap<string, number>

/** Heatmap shade: 0 means no time that day, 4 is the darkest. */
export type HeatLevel = 0 | 1 | 2 | 3 | 4

export type HeatCell = {
  date: string
  minutes: number
  level: HeatLevel
}

export const HEATMAP_WEEKS = 26

/** Parses `YYYY-MM-DD` as a local date (not UTC, so it never shifts by a day). */
export function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function format(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Calendar arithmetic on local dates. Uses the calendar, not 24-hour steps, so daylight saving never skews it. */
export function addDays(date: string, days: number): string {
  const value = parseLocalDate(date)
  value.setDate(value.getDate() + days)
  return format(value)
}

/** Monday of the week that contains `date` (weeks run Monday to Sunday, as in the heatmap). */
export function startOfWeek(date: string): string {
  const day = parseLocalDate(date).getDay() // 0 = Sunday
  return addDays(date, -((day + 6) % 7))
}

export function dailyTotals(deposits: readonly Deposit[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const deposit of deposits) {
    totals.set(deposit.date, (totals.get(deposit.date) ?? 0) + deposit.minutes)
  }
  return totals
}

function sumRange(totals: DailyTotals, from: string, to: string): number {
  let sum = 0
  for (let day = from; day <= to; day = addDays(day, 1)) sum += totals.get(day) ?? 0
  return sum
}

/** Minutes saved from Monday of the current week up to and including today. */
export function weekTotal(totals: DailyTotals, today: string): number {
  return sumRange(totals, startOfWeek(today), today)
}

/** Minutes saved over today and the 29 days before it. */
export function last30Days(totals: DailyTotals, today: string): number {
  return sumRange(totals, addDays(today, -29), today)
}

/**
 * Consecutive days with at least one deposit, ending today. If today has no deposit yet, yesterday's streak stays
 * alive until the day ends (BR-10).
 */
export function streak(totals: DailyTotals, today: string): number {
  let day = (totals.get(today) ?? 0) > 0 ? today : addDays(today, -1)
  let count = 0
  while ((totals.get(day) ?? 0) > 0) {
    count += 1
    day = addDays(day, -1)
  }
  return count
}

/** Number of different days that have at least one deposit, all time. */
export function activeDays(totals: DailyTotals): number {
  let count = 0
  for (const minutes of totals.values()) if (minutes > 0) count += 1
  return count
}

/** Shade for a day: none, under 1h, 1 to 2h, 2 to 3h, 3h or more (docs/DESIGN.md section 22.1). */
export function heatLevel(minutes: number): HeatLevel {
  if (minutes <= 0) return 0
  if (minutes < 60) return 1
  if (minutes < 120) return 2
  if (minutes < 180) return 3
  return 4
}

/**
 * Heatmap columns, oldest week first. Each column has 7 slots, Monday to Sunday; days after today are `null`.
 * The last column is the current week.
 */
export function heatmapWeeks(
  totals: DailyTotals,
  today: string,
  weeks = HEATMAP_WEEKS,
): (HeatCell | null)[][] {
  const firstMonday = addDays(startOfWeek(today), -7 * (weeks - 1))
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(firstMonday, w * 7 + d)
      if (date > today) return null
      const minutes = totals.get(date) ?? 0
      return { date, minutes, level: heatLevel(minutes) }
    }),
  )
}
