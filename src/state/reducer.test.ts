import { describe, expect, it } from 'vitest'
import { emptyData, type AppData, type Pig } from '../domain/types'
import { prepareCreatePig, reducer, type Env } from './reducer'

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
