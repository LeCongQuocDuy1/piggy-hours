import type { PigMood } from '../components/pig/pigMood'
import type { Deposit, Pig, PigStatus } from './types'

/** Total saved minutes, always computed from deposits (BR-01). */
export function savedMinutes(pig: Pig, deposits: Deposit[]): number {
  let total = 0
  for (const d of deposits) if (d.pigId === pig.id) total += d.minutes
  return total
}

/** Remaining = target - saved, never below 0 (BR-03). */
export function remainingMinutes(pig: Pig, deposits: Deposit[]): number {
  return Math.max(0, pig.targetMinutes - savedMinutes(pig, deposits))
}

/** Percentage rounded down to one decimal place, never above 100 (BR-05). */
export function progressPercent(pig: Pig, deposits: Deposit[]): number {
  if (pig.targetMinutes <= 0) return 0
  const raw = (savedMinutes(pig, deposits) / pig.targetMinutes) * 100
  return Math.min(100, Math.floor(raw * 10) / 10)
}

/** `completed` if it has `completedAt`, else `full` when saved reaches the target, else `active` (BR-04). */
export function pigStatus(pig: Pig, deposits: Deposit[]): PigStatus {
  if (pig.completedAt) return 'completed'
  return savedMinutes(pig, deposits) >= pig.targetMinutes ? 'full' : 'active'
}

/** Expression bands from docs/DESIGN.md section 16. */
export function moodForProgress(percent: number): PigMood {
  if (percent >= 100) return 'overjoyed'
  if (percent >= 75) return 'excited'
  if (percent >= 50) return 'happy'
  if (percent >= 25) return 'curious'
  return 'sleepy'
}
