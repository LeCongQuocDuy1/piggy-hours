import { PIG_COLORS, type PigColorName } from '../components/pig/pigColors'
import { pigStatus, savedMinutes } from './pigs'
import { formatMinutesShort, isValidDateString } from './time'
import { err, ok, type Deposit, type Pig, type Result } from './types'
import {
  DEFAULT_COLOR,
  DEFAULT_EMOJI,
  MAX_TARGET_HOURS,
  MIN_TARGET_HOURS,
  NAME_MAX_LENGTH,
  type PigFieldErrors,
  type PigInput,
  type ValidPig,
} from './validation'

export type PigEditErrors = PigFieldErrors & {
  /** The pig cannot be edited at all (completed). */
  pig?: string
}

/**
 * Validates the edit-pig form (US-05).
 * - Name, emoji, color and deadline can be changed until the pig is completed.
 * - The target can only change while the pig is `active`, and never below the time already saved.
 * - A deadline that is already in the past is accepted if the user did not change it.
 */
export function validatePigEdit(
  input: PigInput,
  pig: Pig,
  deposits: Deposit[],
  today: string,
): Result<ValidPig, PigEditErrors> {
  const status = pigStatus(pig, deposits)
  if (status === 'completed') {
    return err({ pig: 'A completed pig cannot be edited.' })
  }

  const errors: PigEditErrors = {}

  const name = input.name.trim()
  if (name.length === 0) errors.name = 'Give your pig a name.'
  else if ([...name].length > NAME_MAX_LENGTH)
    errors.name = `Use ${NAME_MAX_LENGTH} characters or fewer.`

  let targetMinutes = pig.targetMinutes
  if (status === 'active') {
    const hoursText = input.targetHours.trim()
    if (hoursText === '') errors.targetHours = 'Enter a target in whole hours.'
    else if (!/^\d+$/.test(hoursText)) errors.targetHours = 'Use whole hours, like 50.'
    else {
      const hours = Number(hoursText)
      const saved = savedMinutes(pig, deposits)
      if (hours < MIN_TARGET_HOURS || hours > MAX_TARGET_HOURS)
        errors.targetHours = `Choose between ${MIN_TARGET_HOURS} and ${MAX_TARGET_HOURS.toLocaleString('en-US')} hours.`
      else if (hours * 60 < saved)
        errors.targetHours = `You already saved ${formatMinutesShort(saved)}. The target cannot be lower.`
      else targetMinutes = hours * 60
    }
  }

  const deadline = (input.deadline ?? '').trim()
  if (deadline !== '') {
    if (!isValidDateString(deadline)) errors.deadline = 'Pick a valid date.'
    else if (deadline < today && deadline !== pig.deadline)
      errors.deadline = 'The deadline cannot be in the past.'
  }

  if (Object.keys(errors).length > 0) return err(errors)

  const color: PigColorName =
    input.color && input.color in PIG_COLORS
      ? (input.color as PigColorName)
      : DEFAULT_COLOR
  return ok({
    name,
    targetMinutes,
    emoji: input.emoji?.trim() || DEFAULT_EMOJI,
    color,
    ...(deadline ? { deadline } : {}),
  })
}
