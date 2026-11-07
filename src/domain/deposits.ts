import { pigStatus, remainingMinutes } from './pigs'
import { formatMinutesShort, isValidDateString, parseDuration } from './time'
import { err, ok, type Deposit, type Pig, type Result } from './types'

export const NOTE_MAX_LENGTH = 200
const MINUTES_PER_DAY = 24 * 60

export type DepositInput = {
  /** Raw text from the form. */
  hours: string
  minutes: string
  /** `YYYY-MM-DD`. */
  date: string
  note?: string
}

export type DepositErrors = {
  /** Problem with the hours/minutes fields. */
  duration?: string
  /** Set when the time is more than what is left: the UI offers "Fill the pig" with this value (BR-03). */
  tooMuch?: { remaining: number }
  date?: string
  note?: string
  /** The pig cannot receive time at all (full or completed). */
  pig?: string
}

export type ValidDeposit = { minutes: number; date: string; note?: string }

/** Validates the add-time form (US-02). `today` is a local `YYYY-MM-DD` date passed in by the caller. */
export function validateDeposit(
  input: DepositInput,
  pig: Pig,
  deposits: Deposit[],
  today: string,
): Result<ValidDeposit, DepositErrors> {
  const errors: DepositErrors = {}

  const status = pigStatus(pig, deposits)
  if (status === 'completed')
    errors.pig = 'This pig is completed and can no longer take time.'
  else if (status === 'full')
    errors.pig = 'This pig is full. Mark it as completed to start a new goal.'

  const duration = parseDuration(input.hours, input.minutes)
  let minutes = 0
  if (!duration.ok) {
    errors.duration = {
      NOT_A_NUMBER: 'Use whole numbers only.',
      NEGATIVE: 'Time cannot be negative.',
      MINUTES_TOO_LARGE: 'Minutes must be between 0 and 59.',
      ZERO: 'Enter at least 1 minute.',
    }[duration.error]
  } else {
    minutes = duration.value
    const remaining = remainingMinutes(pig, deposits)
    if (!errors.pig && minutes > remaining) {
      errors.duration = `Only ${formatMinutesShort(remaining)} left in this pig.`
      errors.tooMuch = { remaining }
    }
  }

  const date = input.date.trim()
  if (!isValidDateString(date)) errors.date = 'Pick a valid date.'
  else if (date > today) errors.date = 'Choose today or an earlier date.'

  const note = (input.note ?? '').trim()
  if ([...note].length > NOTE_MAX_LENGTH)
    errors.note = `Use ${NOTE_MAX_LENGTH} characters or fewer.`

  if (Object.keys(errors).length > 0) return err(errors)
  return ok({ minutes, date, ...(note ? { note } : {}) })
}

/** Total minutes deposited on one local day, across all pigs. */
export function minutesOnDay(deposits: Deposit[], date: string): number {
  let total = 0
  for (const d of deposits) if (d.date === date) total += d.minutes
  return total
}

/** Non-blocking warning (BR-09): true when this deposit would take the day above 24 hours. */
export function exceedsDayLimit(
  deposits: Deposit[],
  date: string,
  minutes: number,
): boolean {
  return minutesOnDay(deposits, date) + minutes > MINUTES_PER_DAY
}
