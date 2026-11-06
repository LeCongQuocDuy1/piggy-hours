import {
  CURRENT_VERSION,
  emptyData,
  err,
  ok,
  type AppData,
  type Result,
} from '../domain/types'
import { isAppData } from './guards'
import { migrate } from './migrations'
import type { Storage, StorageError } from './storage'

export const STORAGE_KEY = 'piggy-hours:v1'
export const BACKUP_PREFIX = 'piggy-hours:backup-'

/** The small part of the browser Storage API we use, so tests can pass a fake. */
export type KeyValueStore = Pick<globalThis.Storage, 'getItem' | 'setItem'>

function describe(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/**
 * One JSON blob under one key, so a save is atomic. Corrupted data is never overwritten silently: it is copied
 * to a backup key first and the app starts empty (docs/ARCHITECTURE.md section 6).
 */
export function createLocalStorage(
  store?: KeyValueStore,
  now: () => number = Date.now,
): Storage {
  const getStore = (): KeyValueStore | null => {
    if (store) return store
    try {
      return window.localStorage
    } catch {
      return null // access can throw when site data is blocked
    }
  }

  return {
    load(): Result<AppData, StorageError> {
      const kv = getStore()
      if (!kv)
        return err({ kind: 'UNAVAILABLE', message: 'Browser storage is not available.' })

      let text: string | null
      try {
        text = kv.getItem(STORAGE_KEY)
      } catch (e) {
        return err({ kind: 'UNAVAILABLE', message: describe(e) })
      }
      if (text === null) return ok(emptyData())

      const corrupted = (): Result<AppData, StorageError> => {
        const backupKey = `${BACKUP_PREFIX}${now()}`
        try {
          kv.setItem(backupKey, text!)
        } catch {
          return err({ kind: 'CORRUPTED', backupKey: null })
        }
        return err({ kind: 'CORRUPTED', backupKey })
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        return corrupted()
      }
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
        return corrupted()

      const raw = parsed as Record<string, unknown>
      if (typeof raw.version === 'number' && raw.version > CURRENT_VERSION) {
        return err({ kind: 'NEWER_VERSION', version: raw.version })
      }
      const migrated = migrate(raw)
      if (!migrated || !isAppData(migrated)) return corrupted()
      return ok(migrated)
    },

    save(data: AppData): Result<void, StorageError> {
      const kv = getStore()
      if (!kv)
        return err({ kind: 'UNAVAILABLE', message: 'Browser storage is not available.' })
      try {
        kv.setItem(STORAGE_KEY, JSON.stringify(data))
        return ok(undefined)
      } catch (e) {
        return err({ kind: 'UNAVAILABLE', message: describe(e) })
      }
    },
  }
}
