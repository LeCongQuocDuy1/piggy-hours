import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePulseOnIncrease } from './usePulseOnIncrease'

describe('usePulseOnIncrease', () => {
  it('starts at 0 and ignores the first value', () => {
    const { result } = renderHook(() => usePulseOnIncrease(90))
    expect(result.current).toBe(0)
  })

  it('counts every increase', () => {
    const { result, rerender } = renderHook(({ v }) => usePulseOnIncrease(v), {
      initialProps: { v: 0 },
    })
    rerender({ v: 30 })
    expect(result.current).toBe(1)
    rerender({ v: 60 })
    expect(result.current).toBe(2)
  })

  it('does not count a decrease or an unchanged value', () => {
    const { result, rerender } = renderHook(({ v }) => usePulseOnIncrease(v), {
      initialProps: { v: 60 },
    })
    rerender({ v: 60 })
    rerender({ v: 30 })
    expect(result.current).toBe(0)
  })
})
