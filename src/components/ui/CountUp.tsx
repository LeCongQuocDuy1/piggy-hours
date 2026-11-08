import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../../lib/useCountUp'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'

function Counting({
  value,
  format,
  onDone,
}: {
  value: number
  format: (n: number) => string
  onDone: () => void
}) {
  const n = useCountUp(value)
  useEffect(() => {
    if (n === value) onDone()
  }, [n, value, onDone])
  return <>{format(n)}</>
}

/**
 * Shows a number that counts up the first time it scrolls into view. Screen readers get the final text at once; the
 * counting copy is hidden from them. Without an observer, or with reduced motion, it is plain text.
 */
export function CountUp({
  value,
  format = String,
}: {
  value: number
  format?: (n: number) => string
}) {
  const reduced = usePrefersReducedMotion()
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const ref = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<'waiting' | 'counting' | 'done'>('waiting')
  const plain = reduced || !canObserve

  useEffect(() => {
    const el = ref.current
    if (plain || state !== 'waiting' || !el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setState('counting')
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [plain, state])

  if (plain) return <>{format(value)}</>
  // After the first count the number follows the data directly (no jumping back to 0).
  if (state === 'done') return <>{format(value)}</>
  return (
    <span ref={ref}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden="true">
        {state === 'waiting' ? (
          format(0)
        ) : (
          <Counting value={value} format={format} onDone={() => setState('done')} />
        )}
      </span>
    </span>
  )
}
