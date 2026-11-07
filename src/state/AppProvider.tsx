import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { toLocalDate } from '../domain/time'
import type { DepositInput } from '../domain/deposits'
import { emptyData, type Deposit, type Pig, type Result } from '../domain/types'
import type { PigInput } from '../domain/validation'
import { createLocalStorage } from '../storage/localStorage'
import type { Storage, StorageError } from '../storage/storage'
import {
  prepareAddDeposit,
  prepareCompletePig,
  prepareCreatePig,
  reducer,
  type AddDepositError,
  type CompletePigError,
  type CreatePigError,
  type Env,
} from './reducer'

type AppApi = {
  data: ReturnType<typeof emptyData>
  /** Set when loading or saving failed. The app keeps working in memory (docs/ARCHITECTURE.md section 7). */
  storageError: StorageError | null
  dismissStorageError: () => void
  createPig: (input: PigInput) => Result<Pig, CreatePigError>
  addDeposit: (pigId: string, input: DepositInput) => Result<Deposit, AddDepositError>
  completePig: (
    pigId: string,
  ) => Result<{ pigId: string; completedAt: string }, CompletePigError>
}

const AppContext = createContext<AppApi | null>(null)

const defaultEnv: Env = {
  today: () => toLocalDate(new Date()),
  nowIso: () => new Date().toISOString(),
  newId: () => crypto.randomUUID(),
}

type Props = {
  children: ReactNode
  /** Injected in tests; defaults to localStorage. */
  storage?: Storage
  env?: Env
}

export function AppProvider({ children, storage, env = defaultEnv }: Props) {
  const store = useMemo(() => storage ?? createLocalStorage(), [storage])

  const [initial] = useState(() => {
    const loaded = store.load()
    return loaded.ok
      ? { data: loaded.value, error: null }
      : { data: emptyData(), error: loaded.error }
  })
  const [data, dispatch] = useReducer(reducer, initial.data)
  const [storageError, setStorageError] = useState<StorageError | null>(initial.error)

  // Data from a newer app version is never overwritten. Unreadable (corrupted) data was backed up, so saving
  // starts once the user creates something; until then an empty state is not written over it.
  const neverSave = initial.error?.kind === 'NEWER_VERSION'
  const blockSave = useRef(initial.error?.kind === 'CORRUPTED')
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (neverSave || (blockSave.current && data.pigs.length === 0)) return
    blockSave.current = false
    const saved = store.save(data)
    setStorageError(saved.ok ? null : saved.error)
  }, [data, store, neverSave])

  // Several tabs: pick up changes made in another tab.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'piggy-hours:v1') return
      const loaded = store.load()
      if (loaded.ok) {
        first.current = true // do not write the same data back
        dispatch({ type: 'replaceAll', data: loaded.value })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [store])

  const createPig = useCallback(
    (input: PigInput) => {
      const prepared = prepareCreatePig(data, input, env)
      if (prepared.ok) dispatch({ type: 'createPig', pig: prepared.value })
      return prepared
    },
    [data, env],
  )

  const addDeposit = useCallback(
    (pigId: string, input: DepositInput) => {
      const prepared = prepareAddDeposit(data, pigId, input, env)
      if (prepared.ok) dispatch({ type: 'addDeposit', deposit: prepared.value })
      return prepared
    },
    [data, env],
  )

  const completePig = useCallback(
    (pigId: string) => {
      const prepared = prepareCompletePig(data, pigId, env)
      if (prepared.ok) dispatch({ type: 'completePig', ...prepared.value })
      return prepared
    },
    [data, env],
  )

  const api = useMemo<AppApi>(
    () => ({
      data,
      storageError,
      dismissStorageError: () => setStorageError(null),
      createPig,
      addDeposit,
      completePig,
    }),
    [data, storageError, createPig, addDeposit, completePig],
  )

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppApi {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
