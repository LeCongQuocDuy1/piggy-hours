import type { PigColorName } from '../components/pig/pigColors'

/** A piggy bank with a time goal. Saved time is never stored on the pig: it is computed from deposits (BR-01). */
export type Pig = {
  id: string
  name: string
  /** Whole minutes, 60 to 600,000 (1 to 10,000 hours). */
  targetMinutes: number
  emoji: string
  color: PigColorName
  /** Local calendar date, `YYYY-MM-DD`. */
  deadline?: string
  /** ISO 8601, UTC. */
  createdAt: string
  /** ISO 8601, UTC. Present once the user marks the pig as completed. */
  completedAt?: string
}

/** Time dropped into a pig. */
export type Deposit = {
  id: string
  pigId: string
  /** Local calendar date the time was spent, `YYYY-MM-DD` (BR-07). */
  date: string
  /** Whole minutes, at least 1. */
  minutes: number
  note?: string
  /** ISO 8601, UTC. */
  createdAt: string
}

export type AppData = {
  /** Schema version, used by storage migrations. */
  version: number
  pigs: Pig[]
  deposits: Deposit[]
  /** Stored separately from the pig list so it survives deleting pigs (BR-08). */
  achievements: { completedPigsCount: number }
}

export type PigStatus = 'active' | 'full' | 'completed'

export const CURRENT_VERSION = 1

export function emptyData(): AppData {
  return {
    version: CURRENT_VERSION,
    pigs: [],
    deposits: [],
    achievements: { completedPigsCount: 0 },
  }
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error })
