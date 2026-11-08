import { describe, expect, it } from 'vitest'
import { pigStatus } from '../domain/pigs'
import type { AppData, Deposit, Pig } from '../domain/types'
import {
  prepareDeleteDeposit,
  prepareDeletePig,
  prepareUpdateDeposit,
  prepareUpdatePig,
  reducer,
  type Env,
} from './reducer'

const env: Env = {
  today: () => '2026-11-07',
  nowIso: () => '2026-11-07T01:00:00.000Z',
  newId: () => 'x',
}

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
  extra: Partial<Deposit> = {},
): Deposit => ({
  id,
  pigId,
  date: '2026-11-05',
  minutes,
  createdAt: '2026-11-05T00:00:00.000Z',
  ...extra,
})
const state = (over: Partial<AppData> = {}): AppData => ({
  version: 1,
  pigs: [pig('a'), pig('b')],
  deposits: [dep('d1', 'a', 60), dep('d2', 'a', 30, { note: 'old' }), dep('d3', 'b', 45)],
  achievements: { completedPigsCount: 3 },
  ...over,
})

describe('updatePig', () => {
  it('changes the fields and drops the deadline when the form has none', () => {
    const s = state({ pigs: [pig('a', { deadline: '2026-12-01' }), pig('b')] })
    const prepared = prepareUpdatePig(
      s,
      'a',
      { name: 'Renamed', targetHours: '3', emoji: '🎹', color: 'mint', deadline: '' },
      env,
    )
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return
    const next = reducer(s, { type: 'updatePig', ...prepared.value })
    expect(next.pigs[0]).toEqual({
      id: 'a',
      name: 'Renamed',
      targetMinutes: 180,
      emoji: '🎹',
      color: 'mint',
      createdAt: '2026-11-01T00:00:00.000Z',
    })
    expect(next.pigs[1]).toBe(s.pigs[1])
  })

  it('reports an unknown pig and invalid input', () => {
    expect(
      prepareUpdatePig(state(), 'zzz', { name: 'x', targetHours: '1' }, env),
    ).toEqual({
      ok: false,
      error: { kind: 'NO_PIG' },
    })
    const bad = prepareUpdatePig(state(), 'a', { name: '', targetHours: '1' }, env)
    expect(bad).toMatchObject({ ok: false, error: { kind: 'INVALID' } })
  })
})

describe('deletePig', () => {
  it('removes the pig and its deposits only', () => {
    const prepared = prepareDeletePig(state(), 'a')
    expect(prepared).toEqual({
      ok: true,
      value: { pigId: 'a', deposits: 2, minutes: 90 },
    })
    const next = reducer(state(), { type: 'deletePig', pigId: 'a' })
    expect(next.pigs.map((p) => p.id)).toEqual(['b'])
    expect(next.deposits.map((d) => d.id)).toEqual(['d3'])
  })

  it('never reduces the completed count, even for a completed pig', () => {
    const s = state({
      pigs: [pig('a', { completedAt: '2026-11-06T00:00:00.000Z' }), pig('b')],
    })
    const next = reducer(s, { type: 'deletePig', pigId: 'a' })
    expect(next.achievements.completedPigsCount).toBe(3)
  })

  it('reports an unknown pig', () => {
    expect(prepareDeletePig(state(), 'zzz')).toEqual({
      ok: false,
      error: { kind: 'NO_PIG' },
    })
  })
})

describe('updateDeposit', () => {
  const input = (over = {}) => ({
    hours: '0',
    minutes: '45',
    date: '2026-11-04',
    note: 'new',
    ...over,
  })

  it('changes minutes, date and note', () => {
    const prepared = prepareUpdateDeposit(state(), 'd2', input(), env)
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return
    const next = reducer(state(), { type: 'updateDeposit', ...prepared.value })
    expect(next.deposits[1]).toMatchObject({
      id: 'd2',
      minutes: 45,
      date: '2026-11-04',
      note: 'new',
    })
  })

  it('removes the note when it is cleared', () => {
    const prepared = prepareUpdateDeposit(state(), 'd2', input({ note: '' }), env)
    if (!prepared.ok) throw new Error('expected ok')
    const next = reducer(state(), { type: 'updateDeposit', ...prepared.value })
    expect('note' in next.deposits[1]).toBe(false)
  })

  it('may grow up to what is left, counting the old value as free', () => {
    // Pig a: 60 + 30 saved of 120; d2 can become 60 (the other deposit holds 60).
    expect(
      prepareUpdateDeposit(state(), 'd2', input({ hours: '1', minutes: '0' }), env).ok,
    ).toBe(true)
    const tooMuch = prepareUpdateDeposit(
      state(),
      'd2',
      input({ hours: '1', minutes: '1' }),
      env,
    )
    expect(tooMuch).toMatchObject({
      ok: false,
      error: { kind: 'INVALID', errors: { duration: 'Only 1h left in this pig.' } },
    })
  })

  it('lets a full pig shrink a deposit', () => {
    const s = state({ deposits: [dep('d1', 'a', 120)] })
    expect(pigStatus(s.pigs[0], s.deposits)).toBe('full')
    expect(prepareUpdateDeposit(s, 'd1', input({ minutes: '30' }), env).ok).toBe(true)
  })

  it('is read-only for a completed pig, and rejects a future date', () => {
    const done = state({
      pigs: [pig('a', { completedAt: '2026-11-06T00:00:00.000Z' }), pig('b')],
    })
    expect(prepareUpdateDeposit(done, 'd1', input(), env)).toMatchObject({ ok: false })
    expect(
      prepareUpdateDeposit(state(), 'd1', input({ date: '2026-11-08' }), env),
    ).toMatchObject({
      ok: false,
      error: { errors: { date: 'Choose today or an earlier date.' } },
    })
  })

  it('reports an unknown deposit', () => {
    expect(prepareUpdateDeposit(state(), 'zzz', input(), env)).toEqual({
      ok: false,
      error: { kind: 'NO_DEPOSIT' },
    })
  })
})

describe('deleteDeposit', () => {
  it('removes one deposit and returns a full pig to active', () => {
    const s = state({ deposits: [dep('d1', 'a', 120)] })
    expect(pigStatus(s.pigs[0], s.deposits)).toBe('full')
    expect(prepareDeleteDeposit(s, 'd1')).toEqual({
      ok: true,
      value: { depositId: 'd1' },
    })
    const next = reducer(s, { type: 'deleteDeposit', depositId: 'd1' })
    expect(next.deposits).toEqual([])
    expect(pigStatus(next.pigs[0], next.deposits)).toBe('active')
  })

  it('is read-only for completed pigs and reports unknown deposits', () => {
    const done = state({
      pigs: [pig('a', { completedAt: '2026-11-06T00:00:00.000Z' }), pig('b')],
    })
    expect(prepareDeleteDeposit(done, 'd1')).toEqual({
      ok: false,
      error: { kind: 'READ_ONLY' },
    })
    expect(prepareDeleteDeposit(state(), 'zzz')).toEqual({
      ok: false,
      error: { kind: 'NO_DEPOSIT' },
    })
  })
})
