import { pigStatus } from './pigs'
import type { AppData } from './types'

/** Unlock table: completed pigs to slots. Capped at 5 for now (ADR-006). */
const UNLOCKS: { completed: number; slots: number }[] = [
  { completed: 10, slots: 5 },
  { completed: 5, slots: 4 },
  { completed: 2, slots: 3 },
  { completed: 0, slots: 2 },
]

export function slotLimit(completedPigsCount: number): number {
  const count = Math.max(0, completedPigsCount)
  return UNLOCKS.find((u) => count >= u.completed)!.slots
}

/** Only `active` and `full` pigs occupy a slot (BR-06). */
export function usedSlots(data: Pick<AppData, 'pigs' | 'deposits'>): number {
  return data.pigs.filter((p) => pigStatus(p, data.deposits) !== 'completed').length
}

export function canCreatePig(data: AppData): boolean {
  return usedSlots(data) < slotLimit(data.achievements.completedPigsCount)
}
