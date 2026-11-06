import { CURRENT_VERSION } from '../domain/types'

/**
 * One function per step: `MIGRATIONS[n]` upgrades data from version n to n + 1. Version 1 is the first schema,
 * so the table is empty for now. Add an entry here whenever the data shape changes.
 */
const MIGRATIONS: Record<
  number,
  (data: Record<string, unknown>) => Record<string, unknown>
> = {}

/** Brings stored data up to the current version. Returns `null` for versions this build cannot handle. */
export function migrate(raw: Record<string, unknown>): Record<string, unknown> | null {
  let version = raw.version
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1)
    return null
  let data = raw
  while (version < CURRENT_VERSION) {
    const step = MIGRATIONS[version]
    if (!step) return null
    data = { ...step(data), version: version + 1 }
    version += 1
  }
  return data
}
