import { describe, expect, it } from 'vitest'
import {
  backupFileName,
  backupErrorMessage,
  createBackup,
  describeData,
  mergeData,
  parseBackup,
  replaceData,
} from './backup'
import { nextUnlock } from './slots'
import type { AppData, Deposit, Pig } from './types'

const pig = (id: string, over: Partial<Pig> = {}): Pig => ({
  id,
  name: id,
  targetMinutes: 120,
  emoji: '🐷',
  color: 'pink',
  createdAt: '2026-11-01T00:00:00.000Z',
  ...over,
})
const dep = (
  id: string,
  pigId: string,
  minutes: number,
  date = '2026-11-05',
): Deposit => ({
  id,
  pigId,
  date,
  minutes,
  createdAt: '2026-11-05T00:00:00.000Z',
})
const data = (over: Partial<AppData> = {}): AppData => ({
  version: 1,
  pigs: [pig('a')],
  deposits: [dep('d1', 'a', 60)],
  achievements: { completedPigsCount: 0 },
  ...over,
})

describe('createBackup', () => {
  it('adds the app name and export time to the data', () => {
    const file = createBackup(data(), new Date('2026-11-08T01:02:03.000Z'))
    expect(file).toMatchObject({
      app: 'piggy-hours',
      exportedAt: '2026-11-08T01:02:03.000Z',
      version: 1,
    })
    expect(file.pigs).toHaveLength(1)
  })
  it('names the file by date', () => {
    expect(backupFileName('2026-11-08')).toBe('piggy-hours-backup-2026-11-08.json')
  })
})

describe('parseBackup (US-07)', () => {
  const text = (v: unknown) => JSON.stringify(v)

  it('round-trips an exported backup', () => {
    const file = createBackup(data(), new Date('2026-11-08T00:00:00.000Z'))
    const parsed = parseBackup(text(file))
    expect(parsed).toEqual({
      ok: true,
      value: { data: data(), exportedAt: '2026-11-08T00:00:00.000Z' },
    })
  })

  it('accepts the stored app data without the extra fields', () => {
    expect(parseBackup(text(data())).ok).toBe(true)
  })

  it.each([
    ['not JSON', '{oops', 'NOT_JSON'],
    ['an array', '[]', 'NOT_BACKUP'],
    ['a number', '5', 'NOT_BACKUP'],
    ['another app', text({ app: 'other', version: 1, pigs: [] }), 'NOT_BACKUP'],
    ['no version', text({ pigs: [] }), 'NOT_BACKUP'],
    ['no pigs list', text({ version: 1 }), 'NOT_BACKUP'],
    ['a newer version', text({ ...data(), version: 7 }), 'NEWER_VERSION'],
    ['an invalid pig', text({ ...data(), pigs: [{ id: 'a' }] }), 'INVALID'],
    [
      'a deposit of an unknown pig',
      text({ ...data(), deposits: [dep('d9', 'zzz', 5)] }),
      'INVALID',
    ],
    [
      'a negative count',
      text({ ...data(), achievements: { completedPigsCount: -1 } }),
      'INVALID',
    ],
    [
      'a bad date',
      text({ ...data(), deposits: [dep('d9', 'a', 5, '2026-13-40')] }),
      'INVALID',
    ],
  ])('rejects %s', (_name, input, kind) => {
    const r = parseBackup(input)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.error.kind).toBe(kind)
      expect(backupErrorMessage(r.error).length).toBeGreaterThan(10)
    }
  })

  it('names the newer version in its message', () => {
    const r = parseBackup(text({ ...data(), version: 7 }))
    if (r.ok) throw new Error('expected an error')
    expect(backupErrorMessage(r.error)).toContain('7')
  })
})

describe('mergeData', () => {
  it('adds what is missing and keeps what exists', () => {
    const current = data()
    const incoming = data({
      pigs: [pig('a', { name: 'Changed' }), pig('b')],
      deposits: [dep('d1', 'a', 99), dep('d2', 'a', 30), dep('d3', 'b', 45)],
    })
    const { data: merged, summary } = mergeData(current, incoming)
    expect(merged.pigs.map((p) => [p.id, p.name])).toEqual([
      ['a', 'a'],
      ['b', 'b'],
    ])
    expect(merged.deposits.map((d) => d.id).sort()).toEqual(['d1', 'd2', 'd3'])
    expect(merged.deposits.find((d) => d.id === 'd1')?.minutes).toBe(60) // current wins
    expect(summary).toEqual({
      mode: 'merge',
      addedPigs: 1,
      addedDeposits: 2,
      skippedPigs: 0,
      skippedDeposits: 0,
    })
  })

  it('does not change anything when merging the same backup twice', () => {
    const once = mergeData(data(), data()).data
    expect(once).toEqual(data())
    expect(mergeData(once, data()).summary).toMatchObject({
      addedPigs: 0,
      addedDeposits: 0,
    })
  })

  it('skips new active pigs when no slot is free, and their entries', () => {
    const current = data({ pigs: [pig('a'), pig('b')], deposits: [] }) // 2 of 2 slots
    const incoming = data({ pigs: [pig('c')], deposits: [dep('d5', 'c', 10)] })
    const { data: merged, summary } = mergeData(current, incoming)
    expect(merged.pigs.map((p) => p.id)).toEqual(['a', 'b'])
    expect(merged.deposits).toEqual([])
    expect(summary).toMatchObject({ addedPigs: 0, skippedPigs: 1, skippedDeposits: 1 })
  })

  it('always adds completed pigs, and uses the larger completed count', () => {
    const current = data({
      pigs: [pig('a'), pig('b')],
      deposits: [],
      achievements: { completedPigsCount: 1 },
    })
    const incoming = data({
      pigs: [pig('c', { completedAt: '2026-10-01T00:00:00.000Z' })],
      deposits: [dep('d5', 'c', 120)],
      achievements: { completedPigsCount: 2 },
    })
    const { data: merged } = mergeData(current, incoming)
    expect(merged.pigs.map((p) => p.id)).toEqual(['a', 'b', 'c'])
    expect(merged.achievements.completedPigsCount).toBe(2)
  })

  it('uses the slots unlocked by the merged completed count', () => {
    const current = data({
      pigs: [pig('a'), pig('b')],
      deposits: [],
      achievements: { completedPigsCount: 0 },
    })
    const incoming = data({
      pigs: [pig('c')],
      deposits: [],
      achievements: { completedPigsCount: 2 },
    }) // 3 slots
    expect(mergeData(current, incoming).data.pigs).toHaveLength(3)
  })

  it('skips an entry that would overfill its pig', () => {
    const current = data({ deposits: [dep('d1', 'a', 100)] }) // 20 of 120 left
    const incoming = data({ deposits: [dep('d2', 'a', 30)] })
    const { data: merged, summary } = mergeData(current, incoming)
    expect(merged.deposits.map((d) => d.id)).toEqual(['d1'])
    expect(summary.skippedDeposits).toBe(1)
  })
})

describe('replaceData and describeData', () => {
  it('uses the backup as it is', () => {
    const incoming = data({ pigs: [pig('z')], deposits: [] })
    expect(replaceData(incoming)).toMatchObject({
      data: incoming,
      summary: { mode: 'replace', addedPigs: 1, addedDeposits: 0 },
    })
  })
  it('counts pigs, active pigs and entries', () => {
    expect(
      describeData(
        data({ pigs: [pig('a'), pig('b', { completedAt: '2026-11-02T00:00:00.000Z' })] }),
      ),
    ).toEqual({ pigs: 2, active: 1, deposits: 1, completed: 0 })
  })
})

describe('nextUnlock', () => {
  it.each([
    [0, { completed: 2, slots: 3, remaining: 2 }],
    [1, { completed: 2, slots: 3, remaining: 1 }],
    [2, { completed: 5, slots: 4, remaining: 3 }],
    [5, { completed: 10, slots: 5, remaining: 5 }],
    [9, { completed: 10, slots: 5, remaining: 1 }],
    [10, null],
    [50, null],
  ])('after %i completed pigs', (count, expected) => {
    expect(nextUnlock(count)).toEqual(expected)
  })
})
