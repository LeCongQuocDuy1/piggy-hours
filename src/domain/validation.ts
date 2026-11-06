import type { PigColorName } from '../components/pig/pigColors'
import { PIG_COLORS } from '../components/pig/pigColors'
import { isValidDateString } from './time'
import { err, ok, type Result } from './types'

export const NAME_MAX_LENGTH = 50
export const MIN_TARGET_HOURS = 1
export const MAX_TARGET_HOURS = 10_000
export const DEFAULT_EMOJI = '🐷'
export const DEFAULT_COLOR: PigColorName = 'pink'

export type PigInput = {
  name: string
  /** Raw text from the form. */
  targetHours: string
  emoji?: string
  color?: string
  /** `YYYY-MM-DD`, or empty for no deadline. */
  deadline?: string
}

export type PigFieldErrors = Partial<Record<'name' | 'targetHours' | 'deadline', string>>

export type ValidPig = {
  name: string
  targetMinutes: number
  emoji: string
  color: PigColorName
  deadline?: string
}

/** Validates the create-pig form (US-01). `today` is a local `YYYY-MM-DD` date passed in by the caller. */
export function validatePigInput(
  input: PigInput,
  today: string,
): Result<ValidPig, PigFieldErrors> {
  const errors: PigFieldErrors = {}

  const name = input.name.trim()
  if (name.length === 0) errors.name = 'Give your pig a name.'
  else if ([...name].length > NAME_MAX_LENGTH)
    errors.name = `Use ${NAME_MAX_LENGTH} characters or fewer.`

  const hoursText = input.targetHours.trim()
  let hours = NaN
  if (hoursText === '') errors.targetHours = 'Enter a target in whole hours.'
  else if (!/^\d+$/.test(hoursText)) errors.targetHours = 'Use whole hours, like 50.'
  else {
    hours = Number(hoursText)
    if (hours < MIN_TARGET_HOURS || hours > MAX_TARGET_HOURS)
      errors.targetHours = `Choose between ${MIN_TARGET_HOURS} and ${MAX_TARGET_HOURS.toLocaleString('en-US')} hours.`
  }

  const deadline = (input.deadline ?? '').trim()
  if (deadline !== '') {
    if (!isValidDateString(deadline)) errors.deadline = 'Pick a valid date.'
    else if (deadline < today) errors.deadline = 'The deadline cannot be in the past.'
  }

  if (Object.keys(errors).length > 0) return err(errors)

  const color: PigColorName =
    input.color && input.color in PIG_COLORS
      ? (input.color as PigColorName)
      : DEFAULT_COLOR
  return ok({
    name,
    targetMinutes: hours * 60,
    emoji: input.emoji?.trim() || DEFAULT_EMOJI,
    color,
    ...(deadline ? { deadline } : {}),
  })
}
