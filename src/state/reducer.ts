import type { PigInput } from '../domain/validation'
import { validatePigInput, type PigFieldErrors } from '../domain/validation'
import { canCreatePig } from '../domain/slots'
import { err, ok, type AppData, type Pig, type Result } from '../domain/types'

export type Action =
  { type: 'createPig'; pig: Pig } | { type: 'replaceAll'; data: AppData }

/** State changes only. Validation happens in the `prepare...` functions below, before an action is dispatched. */
export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'createPig':
      return { ...state, pigs: [...state.pigs, action.pig] }
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
