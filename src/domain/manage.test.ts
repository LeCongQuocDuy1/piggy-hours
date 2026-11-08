import { describe, expect, it } from 'vitest'
import { validatePigEdit } from './manage'
import type { Deposit, Pig } from './types'

const TODAY = '2026-11-07'
const pig = (over: Partial<Pig> = {}): Pig => ({
  id: 'p1',
  name: 'Piano',
  targetMinutes: 600,
  emoji: '🎹',
  color: 'pink',
  createdAt: '2026-11-01T00:00:00.000Z',
  ...over,
})
const dep = (minutes: number, id = 'd1'): Deposit => ({
  id,
  pigId: 'p1',
  date: '2026-11-05',
  minutes,
  createdAt: '2026-11-05T00:00:00.000Z',
})
const input = (over = {}) => ({
  name: 'Piano',
  targetHours: '10',
  emoji: '🎹',
  color: 'pink',
  deadline: '',
  ...over,
})

describe('validatePigEdit (US-05)', () => {
  it('accepts a new name, emoji, color and target on an active pig', () => {
    const r = validatePigEdit(
      input({ name: '  Guitar  ', targetHours: '20', emoji: '🎸', color: 'mint' }),
      pig(),
      [dep(60)],
      TODAY,
    )
    expect(r).toEqual({
      ok: true,
      value: { name: 'Guitar', targetMinutes: 1200, emoji: '🎸', color: 'mint' },
    })
  })

  it('rejects a target below the time already saved and names the saved time', () => {
    const r = validatePigEdit(input({ targetHours: '2' }), pig(), [dep(180)], TODAY)
    expect(r).toMatchObject({
      ok: false,
      error: { targetHours: 'You already saved 3h. The target cannot be lower.' },
    })
  })

  it('accepts a target equal to the saved time', () => {
    const r = validatePigEdit(input({ targetHours: '3' }), pig(), [dep(180)], TODAY)
    expect(r).toMatchObject({ ok: true, value: { targetMinutes: 180 } })
  })

  it('keeps the target of a full pig and ignores the typed value', () => {
    const r = validatePigEdit(
      input({ targetHours: '99', name: 'Renamed' }),
      pig(),
      [dep(600)],
      TODAY,
    )
    expect(r).toMatchObject({ ok: true, value: { name: 'Renamed', targetMinutes: 600 } })
  })

  it('refuses to edit a completed pig', () => {
    const r = validatePigEdit(
      input(),
      pig({ completedAt: '2026-11-06T00:00:00.000Z' }),
      [dep(600)],
      TODAY,
    )
    expect(r).toMatchObject({
      ok: false,
      error: { pig: 'A completed pig cannot be edited.' },
    })
  })

  it.each([
    [{ name: '' }, 'name'],
    [{ name: 'x'.repeat(51) }, 'name'],
    [{ targetHours: '' }, 'targetHours'],
    [{ targetHours: '1.5' }, 'targetHours'],
    [{ targetHours: '0' }, 'targetHours'],
    [{ targetHours: '10001' }, 'targetHours'],
    [{ deadline: 'nope' }, 'deadline'],
    [{ deadline: '2026-11-06' }, 'deadline'],
  ])('rejects %j', (over, field) => {
    const r = validatePigEdit(input(over), pig(), [], TODAY)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toHaveProperty(field)
  })

  it('accepts a deadline that is already in the past when it was not changed', () => {
    const r = validatePigEdit(
      input({ deadline: '2026-11-01' }),
      pig({ deadline: '2026-11-01' }),
      [],
      TODAY,
    )
    expect(r).toMatchObject({ ok: true, value: { deadline: '2026-11-01' } })
  })

  it('can clear the deadline', () => {
    const r = validatePigEdit(
      input({ deadline: '' }),
      pig({ deadline: '2026-12-01' }),
      [],
      TODAY,
    )
    expect(r.ok && 'deadline' in r.value).toBe(false)
  })
})
