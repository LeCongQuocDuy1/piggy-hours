import { isAppData } from '../storage/guards'
import { migrate } from '../storage/migrations'
import { pigStatus, savedMinutes } from './pigs'
import { slotLimit, usedSlots } from './slots'
import {
  CURRENT_VERSION,
  err,
  ok,
  type AppData,
  type Deposit,
  type Pig,
  type Result,
} from './types'

export const BACKUP_APP = 'piggy-hours'
/** Backups larger than this are refused before reading (a real backup is a few hundred KB at most). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024

/** The backup file: the app data plus two fields that say what it is and when it was made. */
export type BackupFile = AppData & { app: typeof BACKUP_APP; exportedAt: string }

export function createBackup(data: AppData, now: Date): BackupFile {
  return {
    app: BACKUP_APP,
    exportedAt: now.toISOString(),
    ...data,
    version: CURRENT_VERSION,
  }
}

export function backupFileName(today: string): string {
  return `piggy-hours-backup-${today}.json`
}

export type BackupError =
  | { kind: 'TOO_LARGE' }
  | { kind: 'NOT_JSON' }
  | { kind: 'NOT_BACKUP' }
  | { kind: 'NEWER_VERSION'; version: number }
  | { kind: 'INVALID' }

export function backupErrorMessage(error: BackupError): string {
  switch (error.kind) {
    case 'TOO_LARGE':
      return 'This file is too large to be a Piggy Hours backup.'
    case 'NOT_JSON':
      return 'This file could not be read. Choose a .json backup made by Piggy Hours.'
    case 'NOT_BACKUP':
      return 'This does not look like a Piggy Hours backup.'
    case 'NEWER_VERSION':
      return `This backup was made by a newer version of Piggy Hours (data version ${error.version}). Open the latest version of the app to import it.`
    case 'INVALID':
      return 'This backup is damaged or contains unexpected data, so nothing was imported.'
  }
}

export type ParsedBackup = { data: AppData; exportedAt?: string }

/** Reads and validates a backup file's text with the same checks and migrations used for stored data (US-07). */
export function parseBackup(text: string): Result<ParsedBackup, BackupError> {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return err({ kind: 'NOT_JSON' })
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw))
    return err({ kind: 'NOT_BACKUP' })
  const record = raw as Record<string, unknown>
  if (record.app !== undefined && record.app !== BACKUP_APP)
    return err({ kind: 'NOT_BACKUP' })
  if (typeof record.version !== 'number' || !Array.isArray(record.pigs))
    return err({ kind: 'NOT_BACKUP' })
  if (Number.isInteger(record.version) && record.version > CURRENT_VERSION)
    return err({ kind: 'NEWER_VERSION', version: record.version })

  const migrated = migrate(record)
  if (!migrated || !isAppData(migrated)) return err({ kind: 'INVALID' })
  const exportedAt =
    typeof record.exportedAt === 'string' && !Number.isNaN(Date.parse(record.exportedAt))
      ? record.exportedAt
      : undefined
  return ok({
    data: {
      version: CURRENT_VERSION,
      pigs: migrated.pigs,
      deposits: migrated.deposits,
      achievements: migrated.achievements,
    },
    exportedAt,
  })
}

export type ImportSummary = {
  mode: 'merge' | 'replace'
  addedPigs: number
  addedDeposits: number
  /** Pigs left out because no slot was free (merge only). */
  skippedPigs: number
  /** Entries left out because they would overfill a pig, or because their pig was skipped (merge only). */
  skippedDeposits: number
}

/**
 * Merges a backup into the current data. What the user already has always wins: a pig or entry with an id that
 * exists is ignored. New active pigs are added only while a slot is free, and new entries only while they fit in
 * their pig (BR-03, BR-06). The completed count becomes the larger of the two (BR-08).
 */
export function mergeData(
  current: AppData,
  incoming: AppData,
): { data: AppData; summary: ImportSummary } {
  const completedPigsCount = Math.max(
    current.achievements.completedPigsCount,
    incoming.achievements.completedPigsCount,
  )
  const limit = slotLimit(completedPigsCount)
  const pigs: Pig[] = [...current.pigs]
  const deposits: Deposit[] = [...current.deposits]
  const pigIds = new Set(pigs.map((p) => p.id))
  const depositIds = new Set(deposits.map((d) => d.id))
  const skippedPigIds = new Set<string>()
  let addedPigs = 0
  let skippedPigs = 0

  for (const pig of incoming.pigs) {
    if (pigIds.has(pig.id)) continue
    const takesSlot = !pig.completedAt
    if (takesSlot && usedSlots({ pigs, deposits }) >= limit) {
      skippedPigIds.add(pig.id)
      skippedPigs += 1
      continue
    }
    pigs.push(pig)
    pigIds.add(pig.id)
    addedPigs += 1
  }

  const sorted = [...incoming.deposits].sort((a, b) => a.date.localeCompare(b.date))
  let addedDeposits = 0
  let skippedDeposits = 0
  for (const deposit of sorted) {
    if (depositIds.has(deposit.id)) continue
    const pig = pigs.find((p) => p.id === deposit.pigId)
    if (!pig || skippedPigIds.has(deposit.pigId)) {
      skippedDeposits += 1
      continue
    }
    if (savedMinutes(pig, deposits) + deposit.minutes > pig.targetMinutes) {
      skippedDeposits += 1
      continue
    }
    deposits.push(deposit)
    depositIds.add(deposit.id)
    addedDeposits += 1
  }

  return {
    data: {
      version: CURRENT_VERSION,
      pigs,
      deposits,
      achievements: { completedPigsCount },
    },
    summary: { mode: 'merge', addedPigs, addedDeposits, skippedPigs, skippedDeposits },
  }
}

/** Replaces everything with the backup. */
export function replaceData(incoming: AppData): {
  data: AppData
  summary: ImportSummary
} {
  return {
    data: { ...incoming, version: CURRENT_VERSION },
    summary: {
      mode: 'replace',
      addedPigs: incoming.pigs.length,
      addedDeposits: incoming.deposits.length,
      skippedPigs: 0,
      skippedDeposits: 0,
    },
  }
}

/** Counts used by the import dialog. */
export function describeData(data: AppData) {
  return {
    pigs: data.pigs.length,
    active: data.pigs.filter((p) => pigStatus(p, data.deposits) !== 'completed').length,
    deposits: data.deposits.length,
    completed: data.achievements.completedPigsCount,
  }
}
