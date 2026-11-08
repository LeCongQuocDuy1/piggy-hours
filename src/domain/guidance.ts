import { addDays, daysBetween } from './stats'
import { pigStatus, remainingMinutes } from './pigs'
import type { Deposit, Pig } from './types'

/** How many days back the saving pace looks (US-11). */
export const PACE_WINDOW_DAYS = 14
/** Fewer different saving days than this in the window means no forecast (US-11). */
export const MIN_PACE_DAYS = 3
/** Forecasts further away than this are shown as "far away" instead of a date nobody can plan around. */
export const MAX_FORECAST_DAYS = 3650

export type DeadlineGuidance = {
  /** 0 on the deadline day itself, negative once it has passed. */
  daysLeft: number
  /**
   * Minutes to save per day, counting today and the deadline day, rounded up so the plan always finishes in time.
   * `null` once the deadline has passed.
   */
  perDayMinutes: number | null
  remainingMinutes: number
}

/**
 * Deadline guidance (US-10). Only active pigs with a deadline get it: pigs without one, and full or completed pigs,
 * have nothing left to plan.
 */
export function deadlineGuidance(
  pig: Pig,
  deposits: Deposit[],
  today: string,
): DeadlineGuidance | null {
  if (!pig.deadline || pigStatus(pig, deposits) !== 'active') return null
  const remaining = remainingMinutes(pig, deposits)
  const daysLeft = daysBetween(today, pig.deadline)
  return {
    daysLeft,
    // Today counts as a working day, so a deadline tomorrow means two days of saving.
    perDayMinutes: daysLeft >= 0 ? Math.ceil(remaining / (daysLeft + 1)) : null,
    remainingMinutes: remaining,
  }
}

export type ScheduleState = 'ahead' | 'on' | 'behind'

export type Forecast =
  | { kind: 'not-enough-data' }
  /** The pace is so slow that the date is beyond `MAX_FORECAST_DAYS`. */
  | { kind: 'far' }
  | {
      kind: 'estimate'
      /** Estimated day the pig becomes full, `YYYY-MM-DD`. */
      date: string
      daysAway: number
      /** Only when the pig has a deadline: compares the estimate with it. */
      schedule?: { state: ScheduleState; days: number }
    }

/**
 * Average minutes per day over the saving window of one pig: the last 14 days, or since the first deposit in that
 * window when the pig is newer, so a fresh pig is not averaged against days before it existed.
 * Returns the pace and how many different days had a deposit.
 */
export function recentPace(
  pig: Pig,
  deposits: Deposit[],
  today: string,
): { minutesPerDay: number; activeDays: number } {
  const from = addDays(today, -(PACE_WINDOW_DAYS - 1))
  const days = new Set<string>()
  let total = 0
  let first = today
  for (const d of deposits) {
    if (d.pigId !== pig.id || d.date < from || d.date > today) continue
    days.add(d.date)
    total += d.minutes
    if (d.date < first) first = d.date
  }
  if (days.size === 0) return { minutesPerDay: 0, activeDays: 0 }
  const windowDays = daysBetween(first, today) + 1
  return { minutesPerDay: total / windowDays, activeDays: days.size }
}

/**
 * Completion forecast (US-11): remaining time divided by the recent daily pace. Only for active pigs. With a
 * deadline, the estimate is compared with it: earlier is ahead, the same day is on schedule, later is behind.
 */
export function forecast(pig: Pig, deposits: Deposit[], today: string): Forecast | null {
  if (pigStatus(pig, deposits) !== 'active') return null
  const { minutesPerDay, activeDays } = recentPace(pig, deposits, today)
  if (activeDays < MIN_PACE_DAYS || minutesPerDay <= 0) return { kind: 'not-enough-data' }

  const daysAway = Math.max(1, Math.ceil(remainingMinutes(pig, deposits) / minutesPerDay))
  if (daysAway > MAX_FORECAST_DAYS) return { kind: 'far' }

  const date = addDays(today, daysAway)
  if (!pig.deadline) return { kind: 'estimate', date, daysAway }
  const diff = daysBetween(date, pig.deadline) // positive: finishes before the deadline
  const state: ScheduleState = diff > 0 ? 'ahead' : diff === 0 ? 'on' : 'behind'
  return { kind: 'estimate', date, daysAway, schedule: { state, days: Math.abs(diff) } }
}
