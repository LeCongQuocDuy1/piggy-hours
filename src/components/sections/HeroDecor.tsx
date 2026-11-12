import type { CSSProperties } from 'react'
import { TimeToken } from '../pig/TimeToken'

type Bit = {
  kind: 'clock' | 'star' | 'heart'
  x: string
  y: string
  size: number
  r: number
  dur: number
  delay: number
}

// Positions are percentages of the hero. They sit in the right half or the top corners, away from the text; only
// two show on phones so the copy stays calm.
const BITS: (Bit & { phone?: boolean })[] = [
  { kind: 'clock', x: '5%', y: '8%', size: 26, r: -12, dur: 7, delay: 0, phone: true },
  { kind: 'star', x: '52%', y: '8%', size: 22, r: 10, dur: 6, delay: 1.2 },
  { kind: 'heart', x: '91%', y: '7%', size: 24, r: 8, dur: 8, delay: 0.6, phone: true },
  { kind: 'star', x: '57%', y: '58%', size: 20, r: -8, dur: 6.5, delay: 2 },
  { kind: 'clock', x: '95%', y: '72%', size: 28, r: 14, dur: 7.5, delay: 1.5 },
  { kind: 'heart', x: '53%', y: '88%', size: 20, r: -10, dur: 9, delay: 0.3 },
]

function Shape({ kind }: { kind: Bit['kind'] }) {
  if (kind === 'clock') return <TimeToken className="size-full" />
  if (kind === 'star')
    return (
      <svg viewBox="0 0 24 24" className="size-full">
        <path
          d="M12 2.5l2.7 6 6.5.6-4.9 4.3 1.5 6.4L12 16.4 6.2 19.8l1.5-6.4L2.8 9.1l6.5-.6z"
          fill="#FFD866"
          stroke="#E0A92C"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  return (
    <svg viewBox="0 0 24 24" className="size-full">
      <path
        d="M12 21s-8-5.2-8-11a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z"
        fill="#FF9DBA"
        stroke="#E5688F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Clocks, stars and hearts drifting slowly behind the hero. Purely decorative and clipped to the section. */
export function HeroDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="parallax-near absolute inset-0">
        {BITS.map((b, i) => (
          <span
            key={i}
            className={`float-bit absolute opacity-80 ${b.phone ? '' : 'hidden sm:block'}`}
            style={
              {
                left: b.x,
                top: b.y,
                width: b.size,
                height: b.size,
                '--r': `${b.r}deg`,
                '--dur': `${b.dur}s`,
                '--delay': `${b.delay}s`,
              } as CSSProperties
            }
          >
            <Shape kind={b.kind} />
          </span>
        ))}
      </div>
    </div>
  )
}
