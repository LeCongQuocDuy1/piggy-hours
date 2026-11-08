import confetti from 'canvas-confetti'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireConfetti } from './celebrate'

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('fireConfetti', () => {
  it('fires a centre burst now and two side bursts shortly after', async () => {
    vi.useFakeTimers()
    await fireConfetti()
    expect(confetti).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(300)
    expect(confetti).toHaveBeenCalledTimes(3)
  })

  it('asks the library to respect reduced motion as well', async () => {
    vi.useFakeTimers()
    await fireConfetti()
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ disableForReducedMotion: true }),
    )
  })
})
