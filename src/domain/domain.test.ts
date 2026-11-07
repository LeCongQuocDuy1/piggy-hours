import { describe, expect, it } from 'vitest'
import {
  moodForProgress,
  pigStatus,
  progressPercent,
  remainingMinutes,
  savedMinutes,
} from './pigs'
import { canCreatePig, slotLimit, usedSlots } from './slots'
import {
  formatMinutes,
  formatMinutesShort,
  isValidDateString,
  parseDuration,
  toLocalDate,
} from './time'
import { emptyData, type AppData, type Deposit, type Pig } from './types'
import { validatePigInput } from './validation'

const pig = (over: Partial<Pig> = {}): Pig => ({
  id: 'p1',
  name: 'Japanese N3',
  targetMinutes: 600,
  emoji: '📚',
  color: 'pink',
  createdAt: '2026-11-06T00:00:00.000Z',
  ...over,
})
const dep = (minutes: number, pigId = 'p1', id = String(Math.random())): Deposit => ({
  id,
  pigId,
  minutes,
  date: '2026-11-06',
  createdAt: '2026-11-06T00:00:00.000Z',
})

describe('formatMinutes', () => {
  it.each([
    [0, '0h 0m'],
    [45, '0h 45m'],
    [60, '1h 0m'],
    [90, '1h 30m'],
    [7590, '126h 30m'],
  ])('%i minutes is %s', (m, text) => expect(formatMinutes(m)).toBe(text))

  it('never goes negative or fractional', () => {
    expect(formatMinutes(-5)).toBe('0h 0m')
    expect(formatMinutes(90.9)).toBe('1h 30m')
  })

  it.each([
    [90, '1h 30m'],
    [120, '2h'],
    [45, '45m'],
    [0, '0m'],
  ])('short form of %i is %s', (m, text) => expect(formatMinutesShort(m)).toBe(text))
})

describe('parseDuration', () => {
  it('combines hours and minutes', () => {
    expect(parseDuration('1', '30')).toEqual({ ok: true, value: 90 })
  })
  it('treats a blank field as 0', () => {
    expect(parseDuration('2', '')).toEqual({ ok: true, value: 120 })
    expect(parseDuration('', '45')).toEqual({ ok: true, value: 45 })
    expect(parseDuration(' 1 ', ' ')).toEqual({ ok: true, value: 60 })
  })
  it('rejects zero and blank totals', () => {
    expect(parseDuration('0', '0')).toEqual({ ok: false, error: 'ZERO' })
    expect(parseDuration('', '')).toEqual({ ok: false, error: 'ZERO' })
  })
  it('rejects text, decimals and symbols', () => {
    for (const bad of ['abc', '1.5', '1,5', '1e3', '+2', '١']) {
      expect(parseDuration(bad, '')).toEqual({ ok: false, error: 'NOT_A_NUMBER' })
    }
  })
  it('rejects negative numbers', () => {
    expect(parseDuration('-1', '0')).toEqual({ ok: false, error: 'NEGATIVE' })
    expect(parseDuration('1', '-5')).toEqual({ ok: false, error: 'NEGATIVE' })
  })
  it('rejects 60 or more minutes', () => {
    expect(parseDuration('1', '60')).toEqual({ ok: false, error: 'MINUTES_TOO_LARGE' })
    expect(parseDuration('0', '59')).toEqual({ ok: true, value: 59 })
  })
})

describe('dates', () => {
  it('formats the local calendar date', () => {
    expect(toLocalDate(new Date(2026, 10, 6, 23, 59))).toBe('2026-11-06')
    expect(toLocalDate(new Date(2026, 0, 5, 0, 0))).toBe('2026-01-05')
  })
  it('validates real calendar dates only', () => {
    expect(isValidDateString('2026-11-06')).toBe(true)
    expect(isValidDateString('2026-02-30')).toBe(false)
    expect(isValidDateString('2026-13-01')).toBe(false)
    expect(isValidDateString('06/11/2026')).toBe(false)
    expect(isValidDateString('')).toBe(false)
  })
})

describe('pig calculations', () => {
  it('computes saved time from deposits of that pig only (BR-01)', () => {
    const deposits = [dep(60), dep(30), dep(500, 'other')]
    expect(savedMinutes(pig(), deposits)).toBe(90)
  })
  it('computes remaining time and never goes below zero (BR-03)', () => {
    expect(remainingMinutes(pig(), [dep(90)])).toBe(510)
    expect(remainingMinutes(pig(), [dep(700)])).toBe(0)
  })
  it('rounds progress down to one decimal and caps at 100 (BR-05)', () => {
    expect(progressPercent(pig({ targetMinutes: 300 }), [dep(1)])).toBe(0.3)
    expect(progressPercent(pig({ targetMinutes: 3 }), [dep(1)])).toBe(33.3)
    expect(progressPercent(pig(), [dep(600)])).toBe(100)
    expect(progressPercent(pig(), [dep(9999)])).toBe(100)
    expect(progressPercent(pig(), [])).toBe(0)
  })
  it('derives the status (BR-04)', () => {
    expect(pigStatus(pig(), [dep(599)])).toBe('active')
    expect(pigStatus(pig(), [dep(600)])).toBe('full')
    expect(pigStatus(pig({ completedAt: '2026-11-07T00:00:00.000Z' }), [dep(600)])).toBe(
      'completed',
    )
    expect(pigStatus(pig({ completedAt: '2026-11-07T00:00:00.000Z' }), [])).toBe(
      'completed',
    )
  })
  it('maps progress to the five moods at the band edges', () => {
    expect(moodForProgress(0)).toBe('sleepy')
    expect(moodForProgress(24.9)).toBe('sleepy')
    expect(moodForProgress(25)).toBe('curious')
    expect(moodForProgress(49.9)).toBe('curious')
    expect(moodForProgress(50)).toBe('happy')
    expect(moodForProgress(74.9)).toBe('happy')
    expect(moodForProgress(75)).toBe('excited')
    expect(moodForProgress(99.9)).toBe('excited')
    expect(moodForProgress(100)).toBe('overjoyed')
  })
})

describe('slots', () => {
  it.each([
    [0, 2],
    [1, 2],
    [2, 3],
    [4, 3],
    [5, 4],
    [9, 4],
    [10, 5],
    [500, 5],
    [-3, 2],
  ])('%i completed pigs give %i slots', (completed, slots) =>
    expect(slotLimit(completed)).toBe(slots),
  )

  const data = (pigs: Pig[], deposits: Deposit[] = [], completed = 0): AppData => ({
    ...emptyData(),
    pigs,
    deposits,
    achievements: { completedPigsCount: completed },
  })

  it('counts active and full pigs but not completed ones (BR-06)', () => {
    const d = data(
      [
        pig({ id: 'a' }),
        pig({ id: 'b' }),
        pig({ id: 'c', completedAt: '2026-11-07T00:00:00.000Z' }),
      ],
      [dep(600, 'b')],
    )
    expect(usedSlots(d)).toBe(2)
  })
  it('blocks creating a third pig with two slots and allows it after unlocking', () => {
    const two = [pig({ id: 'a' }), pig({ id: 'b' })]
    expect(canCreatePig(data([pig({ id: 'a' })]))).toBe(true)
    expect(canCreatePig(data(two))).toBe(false)
    expect(canCreatePig(data(two, [], 2))).toBe(true)
  })
  it('a full pig still occupies its slot until completed', () => {
    const d = data([pig({ id: 'a' }), pig({ id: 'b' })], [dep(600, 'a')])
    expect(canCreatePig(d)).toBe(false)
  })
})

describe('validatePigInput', () => {
  const today = '2026-11-06'
  const base = { name: 'Japanese N3', targetHours: '300' }

  it('accepts a minimal pig and applies defaults', () => {
    const r = validatePigInput(base, today)
    expect(r).toEqual({
      ok: true,
      value: { name: 'Japanese N3', targetMinutes: 18000, emoji: '🐷', color: 'pink' },
    })
  })
  it('keeps emoji, color and deadline when given', () => {
    const r = validatePigInput(
      { ...base, emoji: '📚', color: 'mint', deadline: '2026-12-31' },
      today,
    )
    expect(r).toEqual({
      ok: true,
      value: {
        name: 'Japanese N3',
        targetMinutes: 18000,
        emoji: '📚',
        color: 'mint',
        deadline: '2026-12-31',
      },
    })
  })
  it('falls back to the default color for an unknown one', () => {
    const r = validatePigInput({ ...base, color: 'neon' }, today)
    expect(r.ok && r.value.color).toBe('pink')
  })
  it('allows a deadline of today', () => {
    expect(validatePigInput({ ...base, deadline: today }, today).ok).toBe(true)
  })
  it('trims the name and rejects blank or whitespace-only names', () => {
    const r = validatePigInput({ ...base, name: '  Piano  ' }, today)
    expect(r.ok && r.value.name).toBe('Piano')
    for (const name of ['', '   ', '\t\n']) {
      const bad = validatePigInput({ ...base, name }, today)
      expect(!bad.ok && bad.error.name).toBeTruthy()
    }
  })
  it('limits the name to 50 characters, counting emoji as one', () => {
    expect(validatePigInput({ ...base, name: 'a'.repeat(50) }, today).ok).toBe(true)
    expect(validatePigInput({ ...base, name: 'a'.repeat(51) }, today).ok).toBe(false)
    expect(validatePigInput({ ...base, name: '🐷'.repeat(50) }, today).ok).toBe(true)
  })
  it('requires whole target hours from 1 to 10,000', () => {
    for (const h of ['', 'abc', '1.5', '-5', '0', '10001', '1e3']) {
      const r = validatePigInput({ ...base, targetHours: h }, today)
      expect(r.ok).toBe(false)
    }
    for (const h of ['1', '10000'])
      expect(validatePigInput({ ...base, targetHours: h }, today).ok).toBe(true)
    const r = validatePigInput({ ...base, targetHours: '10000' }, today)
    expect(r.ok && r.value.targetMinutes).toBe(600_000)
  })
  it('rejects a deadline in the past or an invalid date', () => {
    const past = validatePigInput({ ...base, deadline: '2026-11-05' }, today)
    expect(!past.ok && past.error.deadline).toMatch(/past/)
    expect(validatePigInput({ ...base, deadline: '2026-02-30' }, today).ok).toBe(false)
  })
  it('reports every problem at once', () => {
    const r = validatePigInput(
      { name: '', targetHours: 'x', deadline: '2020-01-01' },
      today,
    )
    expect(!r.ok && Object.keys(r.error).sort()).toEqual([
      'deadline',
      'name',
      'targetHours',
    ])
  })
})
