import {
  validateDeposit,
  type DepositErrors,
  type DepositInput,
} from '../domain/deposits'
import { pigStatus } from '../domain/pigs'
import type { PigInput } from '../domain/validation'
import { validatePigEdit, type PigEditErrors } from '../domain/manage'
import {
  validatePigInput,
  type PigFieldErrors,
  type ValidPig,
} from '../domain/validation'
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
  | { type: 'updatePig'; pigId: string; changes: ValidPig }
  | { type: 'deletePig'; pigId: string }
  | {
      type: 'updateDeposit'
      depositId: string
      changes: { minutes: number; date: string; note?: string }
    }
  | { type: 'deleteDeposit'; depositId: string }
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
    case 'updatePig':
      return {
        ...state,
        pigs: state.pigs.map((p) => {
          if (p.id !== action.pigId) return p
          // The deadline is optional: take it from the form, and drop it when the form has none.
          const { deadline: _old, ...rest } = p
          void _old
          return { ...rest, ...action.changes }
        }),
      }
    case 'deletePig':
      // The completed count is kept in `achievements`, so deleting a pig never locks slots again (BR-08).
      return {
        ...state,
        pigs: state.pigs.filter((p) => p.id !== action.pigId),
        deposits: state.deposits.filter((d) => d.pigId !== action.pigId),
      }
    case 'updateDeposit':
      return {
        ...state,
        deposits: state.deposits.map((d) => {
          if (d.id !== action.depositId) return d
          const { note: _old, ...rest } = d
          void _old
          return { ...rest, ...action.changes }
        }),
      }
    case 'deleteDeposit':
      return {
        ...state,
        deposits: state.deposits.filter((d) => d.id !== action.depositId),
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

export type UpdatePigError =
  { kind: 'NO_PIG' } | { kind: 'INVALID'; errors: PigEditErrors }

/** Validates the edit form for one pig. The caller dispatches `{ type: 'updatePig', pigId, changes }`. */
export function prepareUpdatePig(
  state: AppData,
  pigId: string,
  input: PigInput,
  env: Env,
): Result<{ pigId: string; changes: ValidPig }, UpdatePigError> {
  const pig = state.pigs.find((p) => p.id === pigId)
  if (!pig) return err({ kind: 'NO_PIG' })
  const valid = validatePigEdit(input, pig, state.deposits, env.today())
  if (!valid.ok) return err({ kind: 'INVALID', errors: valid.error })
  return ok({ pigId, changes: valid.value })
}

export type DeletePigError = { kind: 'NO_PIG' }

/** Deleting a pig also deletes its deposits; the result says how many were lost, for the confirmation text. */
export function prepareDeletePig(
  state: AppData,
  pigId: string,
): Result<{ pigId: string; deposits: number; minutes: number }, DeletePigError> {
  const pig = state.pigs.find((p) => p.id === pigId)
  if (!pig) return err({ kind: 'NO_PIG' })
  const own = state.deposits.filter((d) => d.pigId === pigId)
  return ok({
    pigId,
    deposits: own.length,
    minutes: own.reduce((t, d) => t + d.minutes, 0),
  })
}

export type UpdateDepositError =
  { kind: 'NO_DEPOSIT' } | { kind: 'INVALID'; errors: DepositErrors }

/**
 * Validates an edited deposit (US-06). The deposit is taken out of the totals first, so it may grow up to what is
 * left, and a full pig can shrink it. Completed pigs are read-only.
 */
export function prepareUpdateDeposit(
  state: AppData,
  depositId: string,
  input: DepositInput,
  env: Env,
): Result<
  { depositId: string; changes: { minutes: number; date: string; note?: string } },
  UpdateDepositError
> {
  const deposit = state.deposits.find((d) => d.id === depositId)
  const pig = deposit && state.pigs.find((p) => p.id === deposit.pigId)
  if (!deposit || !pig) return err({ kind: 'NO_DEPOSIT' })
  const others = state.deposits.filter((d) => d.id !== depositId)
  const valid = validateDeposit(input, pig, others, env.today())
  if (!valid.ok) return err({ kind: 'INVALID', errors: valid.error })
  return ok({ depositId, changes: valid.value })
}

export type DeleteDepositError = { kind: 'NO_DEPOSIT' } | { kind: 'READ_ONLY' }

/** Deleting time from a full pig makes it active again, because the status is derived (BR-04). */
export function prepareDeleteDeposit(
  state: AppData,
  depositId: string,
): Result<{ depositId: string }, DeleteDepositError> {
  const deposit = state.deposits.find((d) => d.id === depositId)
  const pig = deposit && state.pigs.find((p) => p.id === deposit.pigId)
  if (!deposit || !pig) return err({ kind: 'NO_DEPOSIT' })
  if (pig.completedAt) return err({ kind: 'READ_ONLY' })
  return ok({ depositId })
}
