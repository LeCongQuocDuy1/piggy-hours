import { useState } from 'react'

/**
 * Counts how many times `value` has gone up since the component first rendered. The count is used as a React `key`
 * so a CSS animation restarts on every increase. Decreases and the first render do not count.
 */
export function usePulseOnIncrease(value: number): number {
  const [previous, setPrevious] = useState(value)
  const [pulses, setPulses] = useState(0)
  if (value !== previous) {
    setPrevious(value)
    if (value > previous) setPulses(pulses + 1)
  }
  return pulses
}
