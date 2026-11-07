import { describe, expect, it } from 'vitest'
import { exceedsDayLimit, minutesOnDay, validateDeposit } from './deposits'
import type { Deposit, Pig } from './types'

const today = '2026-11-07'
const pig = (over: Partial<Pig> = {}): Pig => ({
  id: 'p1',
  name: 'React course',
  targetMinutes: 600,
  emoji: '💻',
  color: 'lavender',
  createdAt: '2026-11-01T00:00:00.000Z',
  ...over,
})
const dep = (minutes: number, over: Partial<Deposit> = {}): Deposit => ({
  id: String(Math.random()),
  pigId: 'p1',
  date: today,
  minutes,
  createdAt: '2026-11-07T00:00:00.000Z',
  ...over,
})
const input = (hours: string, minutes: string, date = today, note?: string) => ({
  hours,
  minutes,
  date,
  note,
})

describe('validateDeposit', () => {
  it('accepts hours and minutes and returns whole minutes', () => {
    expect(validateDeposit(input('1', '30'), pig(), [], today)).toEqual({
      ok: true,
      value: { minutes: 90, date: today },
    })
  })

  it('accepts either field blank', () => {
    const r = validateDeposit(input('', '45'), pig(), [], today)
    expect(r.ok && r.value.minutes).toBe(45)
  })

  it('keeps a trimmed note and drops an empty one', () => {
    const withNote = validateDeposit(
      input('1', '', today, '  Chapter 5  '),
      pig(),
      [],
      today,
    )
    expect(withNote.ok && withNote.value.note).toBe('Chapter 5')
    const blank = validateDeposit(input('1', '', today, '   '), pig(), [], today)
    expect(blank.ok && 'note' in blank.value).toBe(false)
  })

  it('explains each duration problem', () => {
    const cases: [string, string, string][] = [
      ['0', '0', 'Enter at least 1 minute.'],
      ['', '', 'Enter at least 1 minute.'],
      ['1', '60', 'Minutes must be between 0 and 59.'],
      ['1.5', '', 'Use whole numbers only.'],
      ['-1', '', 'Time cannot be negative.'],
    ]
    for (const [h, m, message] of cases) {
      const r = validateDeposit(input(h, m), pig(), [], today)
      expect(!r.ok && r.error.duration).toBe(message)
    }
  })

  it('rejects more than the remaining time and reports how much is left (BR-03)', () => {
    const r = validateDeposit(input('3', '0'), pig(), [dep(540)], today)
    expect(r).toEqual({
      ok: false,
      error: { duration: 'Only 1h left in this pig.', tooMuch: { remaining: 60 } },
    })
  })

  it('allows exactly the remaining time', () => {
    const r = validateDeposit(input('1', '0'), pig(), [dep(540)], today)
    expect(r.ok && r.value.minutes).toBe(60)
  })

  it('refuses any deposit into a full pig', () => {
    const r = validateDeposit(input('0', '1'), pig(), [dep(600)], today)
    expect(!r.ok && r.error.pig).toMatch(/full/)
    expect(!r.ok && r.error.tooMuch).toBeUndefined()
  })

  it('refuses any deposit into a completed pig', () => {
    const r = validateDeposit(
      input('0', '1'),
      pig({ completedAt: '2026-11-07T01:00:00.000Z' }),
      [],
      today,
    )
    expect(!r.ok && r.error.pig).toMatch(/completed/)
  })

  it('allows today and past dates but not future or invalid ones', () => {
    expect(validateDeposit(input('1', '', '2020-01-01'), pig(), [], today).ok).toBe(true)
    expect(validateDeposit(input('1', '', today), pig(), [], today).ok).toBe(true)
    const future = validateDeposit(input('1', '', '2026-11-08'), pig(), [], today)
    expect(!future.ok && future.error.date).toBe('Choose today or an earlier date.')
    const invalid = validateDeposit(input('1', '', '2026-02-30'), pig(), [], today)
    expect(!invalid.ok && invalid.error.date).toBe('Pick a valid date.')
    expect(validateDeposit(input('1', '', ''), pig(), [], today).ok).toBe(false)
  })

  it('limits the note to 200 characters', () => {
    expect(
      validateDeposit(input('1', '', today, 'a'.repeat(200)), pig(), [], today).ok,
    ).toBe(true)
    const r = validateDeposit(input('1', '', today, 'a'.repeat(201)), pig(), [], today)
    expect(!r.ok && r.error.note).toBeTruthy()
  })

  it('reports several problems at once', () => {
    const r = validateDeposit(input('0', '0', '2099-01-01'), pig(), [], today)
    expect(!r.ok && Object.keys(r.error).sort()).toEqual(['date', 'duration'])
  })
})

describe('daily total warning (BR-09)', () => {
  it('sums minutes on one day across pigs', () => {
    const deposits = [dep(60), dep(30, { pigId: 'p2' }), dep(500, { date: '2026-11-06' })]
    expect(minutesOnDay(deposits, today)).toBe(90)
  })
  it('flags totals above 24 hours only', () => {
    expect(exceedsDayLimit([dep(1000)], today, 440)).toBe(false)
    expect(exceedsDayLimit([dep(1000)], today, 441)).toBe(true)
    expect(exceedsDayLimit([dep(1500, { date: '2026-11-06' })], today, 60)).toBe(false)
  })
})
