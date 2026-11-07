import {
  validateDeposit,
  type DepositErrors,
  type DepositInput,
} from '../domain/deposits'
import { pigStatus } from '../domain/pigs'
import type { PigInput } from '../domain/validation'
import { validatePigInput, type PigFieldErrors } from '../domain/validation'
import { canCreatePig } from '../domain/slots'
import {
  err,
  ok,
  type AppData,
  type Deposit,
  type Pig,
  type Result,
} from '../domain/types'

export type Action =
  | { type: 'createPig'; pig: Pig }
  | { type: 'addDeposit'; deposit: Deposit }
  | { type: 'completePig'; pigId: string; completedAt: string }
  | { type: 'replaceAll'; data: AppData }

/** State changes only. Validation happens in the `prepare...` functions below, before an action is dispatched. */
export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'createPig':
      return { ...state, pigs: [...state.pigs, action.pig] }
    case 'addDeposit':
      return { ...state, deposits: [...state.deposits, action.deposit] }
    case 'completePig':
      return {
        ...state,
        pigs: state.pigs.map((p) =>
          p.id === action.pigId ? { ...p, completedAt: action.completedAt } : p,
        ),
        // The count lives apart from the pig list so it survives later deletes (BR-08).
        achievements: {
          ...state.achievements,
          completedPigsCount: state.achievements.completedPigsCount + 1,
        },
      }
    case 'replaceAll':
      return action.data
  }
}

export type CreatePigError =
  { kind: 'NO_SLOT' } | { kind: 'INVALID'; fields: PigFieldErrors }

export type Env = {
  /** Local date as `YYYY-MM-DD`. */
  today: () => string
  /** ISO 8601 UTC timestamp. */
  nowIso: () => string
  newId: () => string
}

/** Checks the slot limit and the form, and builds the pig. The caller dispatches `{ type: 'createPig', pig }`. */
export function prepareCreatePig(
  state: AppData,
  input: PigInput,
  env: Env,
): Result<Pig, CreatePigError> {
  if (!canCreatePig(state)) return err({ kind: 'NO_SLOT' })
  const valid = validatePigInput(input, env.today())
  if (!valid.ok) return err({ kind: 'INVALID', fields: valid.error })
  return ok({ id: env.newId(), createdAt: env.nowIso(), ...valid.value })
}

export type AddDepositError =
  { kind: 'NO_PIG' } | { kind: 'INVALID'; errors: DepositErrors }

/** Validates a deposit for one pig and builds it. The caller dispatches `{ type: 'addDeposit', deposit }`. */
export function prepareAddDeposit(
  state: AppData,
  pigId: string,
  input: DepositInput,
  env: Env,
): Result<Deposit, AddDepositError> {
  const pig = state.pigs.find((p) => p.id === pigId)
  if (!pig) return err({ kind: 'NO_PIG' })
  const valid = validateDeposit(input, pig, state.deposits, env.today())
  if (!valid.ok) return err({ kind: 'INVALID', errors: valid.error })
  return ok({ id: env.newId(), pigId, createdAt: env.nowIso(), ...valid.value })
}

export type CompletePigError = { kind: 'NO_PIG' } | { kind: 'NOT_FULL' }

/** Only a full pig can be completed (US-04). The caller dispatches `{ type: 'completePig', ... }`. */
export function prepareCompletePig(
  state: AppData,
  pigId: string,
  env: Env,
): Result<{ pigId: string; completedAt: string }, CompletePigError> {
  const pig = state.pigs.find((p) => p.id === pigId)
  if (!pig) return err({ kind: 'NO_PIG' })
  if (pigStatus(pig, state.deposits) !== 'full') return err({ kind: 'NOT_FULL' })
  return ok({ pigId, completedAt: env.nowIso() })
}
