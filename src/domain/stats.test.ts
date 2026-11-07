import { describe, expect, it } from 'vitest'
import {
  activeDays,
  addDays,
  dailyTotals,
  heatLevel,
  heatmapWeeks,
  last30Days,
  startOfWeek,
  streak,
  weekTotal,
} from './stats'
import type { Deposit } from './types'

let n = 0
const dep = (date: string, minutes: number, pigId = 'a'): Deposit => ({
  id: `d${n++}`,
  pigId,
  date,
  minutes,
  createdAt: '2026-01-01T00:00:00.000Z',
})

// 2026-11-07 is a Saturday.
const TODAY = '2026-11-07'

describe('calendar helpers', () => {
  it('adds days across month, year and leap-day boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30') // a daylight saving date in many zones
  })

  it('finds Monday of the week', () => {
    expect(startOfWeek('2026-11-07')).toBe('2026-11-02') // Saturday
    expect(startOfWeek('2026-11-02')).toBe('2026-11-02') // Monday
    expect(startOfWeek('2026-11-08')).toBe('2026-11-02') // Sunday belongs to the week that started Monday
    expect(startOfWeek('2026-01-01')).toBe('2025-12-29')
  })
})

describe('dailyTotals', () => {
  it('sums deposits of all pigs per date', () => {
    const totals = dailyTotals([
      dep('2026-11-01', 30),
      dep('2026-11-01', 45, 'b'),
      dep('2026-11-02', 10),
    ])
    expect(totals.get('2026-11-01')).toBe(75)
    expect(totals.get('2026-11-02')).toBe(10)
    expect(totals.get('2026-11-03')).toBeUndefined()
  })

  it('is empty without deposits', () => {
    expect(dailyTotals([]).size).toBe(0)
  })
})

describe('weekTotal and last30Days', () => {
  const totals = dailyTotals([
    dep('2026-11-01', 100), // Sunday of the previous week
    dep('2026-11-02', 60), // Monday
    dep('2026-11-07', 30), // today
    dep('2026-10-09', 20), // exactly 29 days before today
    dep('2026-10-08', 500), // 30 days before: outside
  ])

  it('counts Monday through today', () => {
    expect(weekTotal(totals, TODAY)).toBe(90)
  })

  it('counts the last 30 days including today', () => {
    expect(last30Days(totals, TODAY)).toBe(100 + 60 + 30 + 20)
  })

  it('is zero with no deposits', () => {
    expect(weekTotal(new Map(), TODAY)).toBe(0)
    expect(last30Days(new Map(), TODAY)).toBe(0)
  })
})

describe('streak (BR-10)', () => {
  it('counts consecutive days ending today', () => {
    const totals = dailyTotals([
      dep('2026-11-05', 5),
      dep('2026-11-06', 5),
      dep('2026-11-07', 5),
    ])
    expect(streak(totals, TODAY)).toBe(3)
  })

  it('keeps yesterday’s streak alive when today is still empty', () => {
    const totals = dailyTotals([dep('2026-11-05', 5), dep('2026-11-06', 5)])
    expect(streak(totals, TODAY)).toBe(2)
  })

  it('is broken after a missed day', () => {
    const totals = dailyTotals([dep('2026-11-04', 5), dep('2026-11-07', 5)])
    expect(streak(totals, TODAY)).toBe(1)
    expect(streak(dailyTotals([dep('2026-11-04', 5), dep('2026-11-05', 5)]), TODAY)).toBe(
      0,
    )
  })

  it('is zero without deposits', () => {
    expect(streak(new Map(), TODAY)).toBe(0)
  })

  it('works across a month boundary', () => {
    const totals = dailyTotals([
      dep('2026-10-30', 5),
      dep('2026-10-31', 5),
      dep('2026-11-01', 5),
    ])
    expect(streak(totals, '2026-11-01')).toBe(3)
  })
})

describe('activeDays', () => {
  it('counts different days with time, all time', () => {
    expect(
      activeDays(
        dailyTotals([dep('2025-01-01', 5), dep('2026-11-01', 5), dep('2026-11-01', 5)]),
      ),
    ).toBe(2)
    expect(activeDays(new Map())).toBe(0)
  })
})

describe('heatLevel', () => {
  it.each([
    [0, 0],
    [1, 1],
    [59, 1],
    [60, 2],
    [119, 2],
    [120, 3],
    [179, 3],
    [180, 4],
    [900, 4],
  ])('%i minutes is level %i', (minutes, level) => {
    expect(heatLevel(minutes)).toBe(level)
  })
})

describe('heatmapWeeks', () => {
  const weeks = heatmapWeeks(
    dailyTotals([dep('2026-11-07', 90), dep('2026-11-02', 200)]),
    TODAY,
  )

  it('has 26 columns of 7 days', () => {
    expect(weeks).toHaveLength(26)
    for (const w of weeks) expect(w).toHaveLength(7)
  })

  it('starts on a Monday 25 weeks before this week and ends at today', () => {
    expect(weeks[0][0]?.date).toBe('2026-05-11')
    const last = weeks[25]
    expect(last[0]?.date).toBe('2026-11-02')
    expect(last[5]?.date).toBe(TODAY) // Saturday
  })

  it('leaves days after today empty', () => {
    expect(weeks[25][6]).toBeNull() // Sunday 2026-11-08
    expect(weeks[24].every((c) => c !== null)).toBe(true)
  })

  it('shades days by their total', () => {
    expect(weeks[25][0]).toMatchObject({ minutes: 200, level: 4 })
    expect(weeks[25][5]).toMatchObject({ minutes: 90, level: 2 })
    expect(weeks[25][1]).toMatchObject({ minutes: 0, level: 0 })
  })

  it('shows the whole week when today is Sunday', () => {
    const sunday = heatmapWeeks(new Map(), '2026-11-08')
    expect(sunday[25].every((c) => c !== null)).toBe(true)
    expect(sunday[25][6]?.date).toBe('2026-11-08')
  })
})
