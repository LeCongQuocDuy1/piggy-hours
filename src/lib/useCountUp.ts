import { useEffect, useRef, useState } from 'react'

/**
 * Tweens a number toward `target` over `duration` ms, starting from 0 on the first render and from the number
 * currently shown on later changes.
 */
export function useCountUp(target: number, duration = 700): number {
  const [value, setValue] = useState(0)
  const shown = useRef(0)

  useEffect(() => {
    const from = shown.current
    let frame = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const next = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)))
      shown.current = next
      setValue(next)
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
