import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion'

type Props = {
  children: ReactNode
  /** Wait this long (ms) after entering the view; used to stagger neighbours. */
  delay?: number
  as?: 'div' | 'li'
  className?: string
}

/**
 * Fades and lifts its content into place the first time it scrolls into view. Content is simply shown (no hiding at
 * all) when the system prefers reduced motion or where IntersectionObserver is missing (tests, old browsers).
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className }: Props) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null)
  const canObserve = typeof IntersectionObserver !== 'undefined'
  const [seen, setSeen] = useState(false)
  const shown = seen || reduced || !canObserve

  useEffect(() => {
    const el = ref.current
    if (shown || !el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag
      ref={ref}
      data-shown={shown}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
      className={cn('reveal', className)}
    >
      {children}
    </Tag>
  )
}
