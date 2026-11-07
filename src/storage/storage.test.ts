import { describe, expect, it } from 'vitest'
import { emptyData, type AppData } from '../domain/types'
import {
  BACKUP_PREFIX,
  createLocalStorage,
  STORAGE_KEY,
  type KeyValueStore,
} from './localStorage'
import { isAppData } from './guards'

function fakeStore(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial))
  const store: KeyValueStore & { map: Map<string, string> } = {
    map,
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
  }
  return store
}

const sample = (): AppData => ({
  version: 1,
  pigs: [
    {
      id: 'p1',
      name: 'Japanese N3',
      targetMinutes: 18000,
      emoji: '📚',
      color: 'mint',
      deadline: '2027-01-01',
      createdAt: '2026-11-06T10:00:00.000Z',
    },
  ],
  deposits: [
    {
      id: 'd1',
      pigId: 'p1',
      date: '2026-11-06',
      minutes: 90,
      note: 'Kanji',
      createdAt: '2026-11-06T10:05:00.000Z',
    },
  ],
  achievements: { completedPigsCount: 3 },
})

describe('local storage adapter', () => {
  it('starts empty when nothing is stored', () => {
    expect(createLocalStorage(fakeStore()).load()).toEqual({
      ok: true,
      value: emptyData(),
    })
  })

  it('saves and loads the same data (round trip)', () => {
    const store = fakeStore()
    const storage = createLocalStorage(store)
    expect(storage.save(sample()).ok).toBe(true)
    expect(store.map.has(STORAGE_KEY)).toBe(true)
    expect(storage.load()).toEqual({ ok: true, value: sample() })
  })

  it('keeps data across a new adapter instance (reload)', () => {
    const store = fakeStore()
    createLocalStorage(store).save(sample())
    expect(createLocalStorage(store).load()).toEqual({ ok: true, value: sample() })
  })

  it.each([
    ['not JSON', '{oops'],
    ['an array', '[]'],
    ['a string', '"hi"'],
    ['missing fields', JSON.stringify({ version: 1 })],
    ['a deposit for an unknown pig', JSON.stringify({ ...sample(), pigs: [] })],
    [
      'a negative minute count',
      JSON.stringify({
        ...sample(),
        deposits: [{ ...sample().deposits[0], minutes: -5 }],
      }),
    ],
    [
      'an invalid date',
      JSON.stringify({
        ...sample(),
        deposits: [{ ...sample().deposits[0], date: '2026-02-30' }],
      }),
    ],
    [
      'an unknown color',
      JSON.stringify({ ...sample(), pigs: [{ ...sample().pigs[0], color: 'neon' }] }),
    ],
    ['version 0', JSON.stringify({ ...sample(), version: 0 })],
  ])('backs up and reports corrupted data (%s)', (_name, text) => {
    const store = fakeStore({ [STORAGE_KEY]: text })
    const r = createLocalStorage(store, () => 123).load()
    expect(r).toEqual({
      ok: false,
      error: { kind: 'CORRUPTED', backupKey: `${BACKUP_PREFIX}123` },
    })
    expect(store.map.get(`${BACKUP_PREFIX}123`)).toBe(text)
    expect(store.map.get(STORAGE_KEY)).toBe(text) // the original is never overwritten
  })

  it('reports data from a newer version without touching it', () => {
    const text = JSON.stringify({ ...sample(), version: 99 })
    const store = fakeStore({ [STORAGE_KEY]: text })
    expect(createLocalStorage(store).load()).toEqual({
      ok: false,
      error: { kind: 'NEWER_VERSION', version: 99 },
    })
    expect(store.map.size).toBe(1)
  })

  it('reports a failed backup as corrupted with no backup key', () => {
    const store: KeyValueStore = {
      getItem: () => '{oops',
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(createLocalStorage(store).load()).toEqual({
      ok: false,
      error: { kind: 'CORRUPTED', backupKey: null },
    })
  })

  it('reports a quota error on save instead of throwing', () => {
    const store: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError')
      },
    }
    const r = createLocalStorage(store).save(sample())
    expect(r.ok).toBe(false)
    expect(!r.ok && r.error.kind).toBe('UNAVAILABLE')
  })

  it('reports unavailable storage when reading throws (private mode, blocked data)', () => {
    const store: KeyValueStore = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => undefined,
    }
    const r = createLocalStorage(store).load()
    expect(!r.ok && r.error.kind).toBe('UNAVAILABLE')
  })
})

describe('isAppData', () => {
  it('accepts valid data and rejects duplicates ids', () => {
    expect(isAppData(sample())).toBe(true)
    const dup = sample()
    dup.pigs.push({ ...dup.pigs[0] })
    expect(isAppData(dup)).toBe(false)
  })
})
