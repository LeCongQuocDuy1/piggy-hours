import type { AppData, Result } from '../domain/types'

export type StorageError =
  /** Stored text could not be read as valid app data. A copy was kept under a backup key. */
  | { kind: 'CORRUPTED'; backupKey: string | null }
  /** Saved by a newer version of the app that this version does not understand. */
  | { kind: 'NEWER_VERSION'; version: number }
  /** The browser refused (storage disabled, private mode, quota exceeded). */
  | { kind: 'UNAVAILABLE'; message: string }

/**
 * Where app data lives. The UI and state layers only know this interface, so a server-backed version can
 * replace localStorage later (docs/DECISIONS.md ADR-007).
 */
export interface Storage {
  load(): Result<AppData, StorageError>
  save(data: AppData): Result<void, StorageError>
}
