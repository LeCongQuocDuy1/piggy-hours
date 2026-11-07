import { describe, expect, it } from 'vitest'
import { emptyData, type AppData, type Pig } from '../domain/types'
import {
  prepareAddDeposit,
  prepareCompletePig,
  prepareCreatePig,
  reducer,
  type Env,
} from './reducer'

const env: Env = {
  today: () => '2026-11-07',
  nowIso: () => '2026-11-07T01:00:00.000Z',
  newId: () => 'id-1',
}

const withPigs = (n: number, completed = 0): AppData => ({
  ...emptyData(),
  pigs: Array.from({ length: n }, (_, i): Pig => ({
    id: `p${i}`,
    name: `Pig ${i}`,
    targetMinutes: 600,
    emoji: '🐷',
    color: 'pink',
    createdAt: '2026-11-07T00:00:00.000Z',
  })),
  achievements: { completedPigsCount: completed },
})

describe('prepareCreatePig', () => {
  it('builds a pig with id, timestamp and minutes', () => {
    const r = prepareCreatePig(
      emptyData(),
      { name: ' Piano ', targetHours: '40', emoji: '🎹', color: 'lavender' },
      env,
    )
    expect(r).toEqual({
      ok: true,
      value: {
        id: 'id-1',
        createdAt: '2026-11-07T01:00:00.000Z',
        name: 'Piano',
        targetMinutes: 2400,
        emoji: '🎹',
        color: 'lavender',
      },
    })
  })

  it('returns field errors for invalid input', () => {
    const r = prepareCreatePig(emptyData(), { name: '', targetHours: '0' }, env)
    expect(!r.ok && r.error.kind).toBe('INVALID')
  })

  it('refuses a third pig when two slots are in use', () => {
    const r = prepareCreatePig(withPigs(2), { name: 'Third', targetHours: '5' }, env)
    expect(r).toEqual({ ok: false, error: { kind: 'NO_SLOT' } })
  })

  it('allows a third pig after two completed pigs', () => {
    const r = prepareCreatePig(withPigs(2, 2), { name: 'Third', targetHours: '5' }, env)
    expect(r.ok).toBe(true)
  })
})

describe('reducer', () => {
  it('appends a created pig without changing the input state', () => {
    const state = emptyData()
    const pig = { ...withPigs(1).pigs[0] }
    const next = reducer(state, { type: 'createPig', pig })
    expect(next.pigs).toEqual([pig])
    expect(state.pigs).toEqual([])
  })

  it('replaces everything', () => {
    const data = withPigs(2)
    expect(reducer(emptyData(), { type: 'replaceAll', data })).toBe(data)
  })
})

describe('deposits and completion', () => {
  const base = (): AppData => ({
    ...emptyData(),
    pigs: [
      {
        id: 'p1',
        name: 'React',
        targetMinutes: 120,
        emoji: '💻',
        color: 'sky',
        createdAt: '2026-11-01T00:00:00.000Z',
      },
    ],
  })

  it('builds a deposit and adds it', () => {
    const r = prepareAddDeposit(
      base(),
      'p1',
      { hours: '1', minutes: '30', date: '2026-11-07', note: 'Hooks' },
      env,
    )
    expect(r).toEqual({
      ok: true,
      value: {
        id: 'id-1',
        pigId: 'p1',
        createdAt: '2026-11-07T01:00:00.000Z',
        minutes: 90,
        date: '2026-11-07',
        note: 'Hooks',
      },
    })
    if (r.ok)
      expect(
        reducer(base(), { type: 'addDeposit', deposit: r.value }).deposits,
      ).toHaveLength(1)
  })

  it('refuses a deposit for an unknown pig or an invalid form', () => {
    expect(
      prepareAddDeposit(
        base(),
        'nope',
        { hours: '1', minutes: '', date: '2026-11-07' },
        env,
      ),
    ).toEqual({
      ok: false,
      error: { kind: 'NO_PIG' },
    })
    const r = prepareAddDeposit(
      base(),
      'p1',
      { hours: '5', minutes: '', date: '2026-11-07' },
      env,
    )
    expect(!r.ok && r.error.kind === 'INVALID' && r.error.errors.tooMuch).toEqual({
      remaining: 120,
    })
  })

  it('completes only a full pig, then frees the slot and counts it', () => {
    const state = base()
    expect(prepareCompletePig(state, 'p1', env)).toEqual({
      ok: false,
      error: { kind: 'NOT_FULL' },
    })

    const full: AppData = {
      ...state,
      deposits: [
        {
          id: 'd1',
          pigId: 'p1',
          date: '2026-11-07',
          minutes: 120,
          createdAt: '2026-11-07T00:00:00.000Z',
        },
      ],
    }
    const r = prepareCompletePig(full, 'p1', env)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const done = reducer(full, { type: 'completePig', ...r.value })
    expect(done.pigs[0].completedAt).toBe('2026-11-07T01:00:00.000Z')
    expect(done.achievements.completedPigsCount).toBe(1)
    expect(done.deposits).toEqual(full.deposits)
    expect(prepareCompletePig(done, 'p1', env)).toEqual({
      ok: false,
      error: { kind: 'NOT_FULL' },
    })
  })

  it('frees a slot after completion', () => {
    const full: AppData = {
      ...withPigs(2),
      deposits: [
        {
          id: 'd1',
          pigId: 'p0',
          date: '2026-11-07',
          minutes: 600,
          createdAt: '2026-11-07T00:00:00.000Z',
        },
      ],
    }
    expect(prepareCreatePig(full, { name: 'X', targetHours: '5' }, env).ok).toBe(false)
    const r = prepareCompletePig(full, 'p0', env)
    if (!r.ok) throw new Error('expected ok')
    const done = reducer(full, { type: 'completePig', ...r.value })
    expect(prepareCreatePig(done, { name: 'X', targetHours: '5' }, env).ok).toBe(true)
  })
})
