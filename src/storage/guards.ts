import { PIG_COLORS } from '../components/pig/pigColors'
import { isValidDateString } from '../domain/time'
import type { AppData, Deposit, Pig } from '../domain/types'

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isCount = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0
const isIso = (v: unknown): v is string => isString(v) && !Number.isNaN(Date.parse(v))

function isPig(v: unknown): v is Pig {
  if (!isRecord(v)) return false
  return (
    isString(v.id) &&
    v.id !== '' &&
    isString(v.name) &&
    isCount(v.targetMinutes) &&
    v.targetMinutes >= 1 &&
    isString(v.emoji) &&
    isString(v.color) &&
    v.color in PIG_COLORS &&
    (v.deadline === undefined ||
      (isString(v.deadline) && isValidDateString(v.deadline))) &&
    isIso(v.createdAt) &&
    (v.completedAt === undefined || isIso(v.completedAt))
  )
}

function isDeposit(v: unknown): v is Deposit {
  if (!isRecord(v)) return false
  return (
    isString(v.id) &&
    v.id !== '' &&
    isString(v.pigId) &&
    isString(v.date) &&
    isValidDateString(v.date) &&
    isCount(v.minutes) &&
    v.minutes >= 1 &&
    (v.note === undefined || isString(v.note)) &&
    isIso(v.createdAt)
  )
}

/** Hand-written type guard (docs/ARCHITECTURE.md T5): no schema library needed for a shape this small. */
export function isAppData(v: unknown): v is AppData {
  if (!isRecord(v)) return false
  if (!isCount(v.version)) return false
  if (!Array.isArray(v.pigs) || !v.pigs.every(isPig)) return false
  if (!Array.isArray(v.deposits) || !v.deposits.every(isDeposit)) return false
  if (!isRecord(v.achievements) || !isCount(v.achievements.completedPigsCount))
    return false
  const ids = new Set(v.pigs.map((p) => p.id))
  return ids.size === v.pigs.length && v.deposits.every((d) => ids.has(d.pigId))
}
