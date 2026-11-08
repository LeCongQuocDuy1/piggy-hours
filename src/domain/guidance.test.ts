import { describe, expect, it } from 'vitest'
import { deadlineGuidance, forecast, recentPace } from './guidance'
import { daysBetween } from './stats'
import type { Deposit, Pig } from './types'

const TODAY = '2026-11-10'

function pig(over: Partial<Pig> = {}): Pig {
  return {
    id: 'p1',
    name: 'Piano',
    targetMinutes: 6000, // 100h
    emoji: '🐷',
    color: 'pink',
    createdAt: '2026-10-01T00:00:00.000Z',
    ...over,
  }
}

let n = 0
function dep(date: string, minutes: number, pigId = 'p1'): Deposit {
  n += 1
  return { id: `d${n}`, pigId, date, minutes, createdAt: '2026-11-01T00:00:00.000Z' }
}

describe('daysBetween', () => {
  it('counts calendar days in both directions', () => {
    expect(daysBetween('2026-11-10', '2026-11-10')).toBe(0)
    expect(daysBetween('2026-11-10', '2026-11-15')).toBe(5)
    expect(daysBetween('2026-11-10', '2026-11-08')).toBe(-2)
  })

  it('is not skewed by daylight saving or month and year ends', () => {
    expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2)
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3)
    expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3)
  })
})

describe('deadlineGuidance (US-10)', () => {
  it('has nothing for a pig without a deadline', () => {
    expect(deadlineGuidance(pig(), [], TODAY)).toBeNull()
  })

  it('spreads the remaining time over today and every day up to the deadline', () => {
    // 100h left, deadline in 9 days: 10 working days including today = 10h a day.
    const g = deadlineGuidance(pig({ deadline: '2026-11-19' }), [], TODAY)
    expect(g).toEqual({ daysLeft: 9, perDayMinutes: 600, remainingMinutes: 6000 })
  })

  it('counts only what is still missing', () => {
    const g = deadlineGuidance(
      pig({ deadline: '2026-11-19' }),
      [dep('2026-11-09', 3000)],
      TODAY,
    )
    expect(g?.remainingMinutes).toBe(3000)
    expect(g?.perDayMinutes).toBe(300)
  })

  it('rounds the daily need up so the plan never falls short', () => {
    // 100 minutes over 3 days = 33.33, so 34.
    const g = deadlineGuidance(
      pig({ targetMinutes: 100, deadline: '2026-11-12' }),
      [],
      TODAY,
    )
    expect(g?.perDayMinutes).toBe(34)
  })

  it('on the deadline day, all remaining time is needed today', () => {
    const g = deadlineGuidance(pig({ deadline: TODAY }), [], TODAY)
    expect(g).toMatchObject({ daysLeft: 0, perDayMinutes: 6000 })
  })

  it('after the deadline, reports it as overdue with no daily plan', () => {
    const g = deadlineGuidance(pig({ deadline: '2026-11-07' }), [], TODAY)
    expect(g).toMatchObject({ daysLeft: -3, perDayMinutes: null })
  })

  it('has nothing for full or completed pigs', () => {
    const full = [dep('2026-11-09', 6000)]
    expect(deadlineGuidance(pig({ deadline: '2026-11-19' }), full, TODAY)).toBeNull()
    expect(
      deadlineGuidance(
        pig({ deadline: '2026-11-19', completedAt: '2026-11-09T10:00:00.000Z' }),
        full,
        TODAY,
      ),
    ).toBeNull()
  })

  it('ignores deposits of other pigs', () => {
    const g = deadlineGuidance(
      pig({ deadline: '2026-11-19' }),
      [dep('2026-11-09', 3000, 'other')],
      TODAY,
    )
    expect(g?.remainingMinutes).toBe(6000)
  })
})

describe('recentPace', () => {
  it('averages over the days since the first deposit when the pig is newer than 14 days', () => {
    // 3 deposits across days 2026-11-08..10: 90 min over 3 days = 30 a day.
    const deposits = [dep('2026-11-08', 30), dep('2026-11-09', 30), dep('2026-11-10', 30)]
    expect(recentPace(pig(), deposits, TODAY)).toEqual({
      minutesPerDay: 30,
      activeDays: 3,
    })
  })

  it('counts days without a deposit inside the window as zero days', () => {
    // 60 min on 2026-11-01 and 60 on 2026-11-10: 120 over 10 days.
    const r = recentPace(pig(), [dep('2026-11-01', 60), dep('2026-11-10', 60)], TODAY)
    expect(r.minutesPerDay).toBe(12)
    expect(r.activeDays).toBe(2)
  })

  it('uses a full 14 days once the history is longer, and ignores older deposits', () => {
    const deposits = [dep('2026-10-01', 5000), dep('2026-10-28', 140)]
    // Window starts 2026-10-28 (14 days ending today).
    expect(recentPace(pig(), deposits, TODAY)).toEqual({
      minutesPerDay: 10,
      activeDays: 1,
    })
  })

  it('adds several deposits on one day into a single active day', () => {
    const r = recentPace(pig(), [dep(TODAY, 20), dep(TODAY, 40)], TODAY)
    expect(r).toEqual({ minutesPerDay: 60, activeDays: 1 })
  })

  it('is zero without deposits', () => {
    expect(recentPace(pig(), [], TODAY)).toEqual({ minutesPerDay: 0, activeDays: 0 })
  })
})

describe('forecast (US-11)', () => {
  const pace = [dep('2026-11-08', 60), dep('2026-11-09', 60), dep('2026-11-10', 60)] // 60 min a day

  it('says there is not enough data with fewer than 3 saving days', () => {
    expect(forecast(pig(), [], TODAY)).toEqual({ kind: 'not-enough-data' })
    expect(forecast(pig(), pace.slice(0, 2), TODAY)).toEqual({ kind: 'not-enough-data' })
  })

  it('estimates the finish date from the recent pace', () => {
    // 6000 - 180 = 5820 left at 60 a day = 97 days.
    const f = forecast(pig(), pace, TODAY)
    expect(f).toEqual({ kind: 'estimate', date: '2027-02-15', daysAway: 97 })
  })

  it('has no schedule comparison without a deadline', () => {
    const f = forecast(pig(), pace, TODAY)
    expect(f && f.kind === 'estimate' && f.schedule).toBeUndefined()
  })

  it('is ahead of schedule when the estimate is before the deadline', () => {
    const f = forecast(pig({ deadline: '2027-02-20' }), pace, TODAY)
    expect(f).toMatchObject({ kind: 'estimate', schedule: { state: 'ahead', days: 5 } })
  })

  it('is on schedule when the estimate is the deadline day', () => {
    const f = forecast(pig({ deadline: '2027-02-15' }), pace, TODAY)
    expect(f).toMatchObject({ schedule: { state: 'on', days: 0 } })
  })

  it('is behind schedule when the estimate is after the deadline', () => {
    const f = forecast(pig({ deadline: '2027-02-10' }), pace, TODAY)
    expect(f).toMatchObject({ schedule: { state: 'behind', days: 5 } })
  })

  it('is behind when the deadline has already passed', () => {
    const f = forecast(pig({ deadline: '2026-11-01' }), pace, TODAY)
    expect(f).toMatchObject({ schedule: { state: 'behind' } })
  })

  it('shows the next day at the earliest', () => {
    const almost = [
      dep('2026-11-08', 3000),
      dep('2026-11-09', 2900),
      dep('2026-11-10', 90),
    ]
    // 10 minutes left, pace 2000 a day: still tomorrow, not today.
    expect(forecast(pig(), almost, TODAY)).toMatchObject({
      kind: 'estimate',
      daysAway: 1,
    })
  })

  it('has nothing for full or completed pigs', () => {
    const full = [
      dep('2026-11-08', 2000),
      dep('2026-11-09', 2000),
      dep('2026-11-10', 2000),
    ]
    expect(forecast(pig(), full, TODAY)).toBeNull()
  })

  it('shows "far" instead of an absurd date for a very slow pace', () => {
    const slow = [dep('2026-11-08', 1), dep('2026-11-09', 1), dep('2026-11-10', 1)]
    expect(forecast(pig({ targetMinutes: 600_000 }), slow, TODAY)).toEqual({
      kind: 'far',
    })
  })

  it('does not count deposits of other pigs', () => {
    const others = pace.map((d) => ({ ...d, pigId: 'other' }))
    expect(forecast(pig(), others, TODAY)).toEqual({ kind: 'not-enough-data' })
  })
})
