import { PIG_COLORS, type PigColorName } from '../pig/pigColors'

type Props = {
  /** 0 to 100. */
  value: number
  /** Accessible name, e.g. the pig's name. */
  label: string
  /** Human readable value, e.g. "126h 30m of 300h". Exposed to screen readers. */
  valueText?: string
  color?: PigColorName
  /** Gold fill for full pigs. */
  full?: boolean
}

/** Real progressbar element: meaning never depends on color alone (docs/DESIGN.md section 9). */
export function ProgressBar({
  value,
  label,
  valueText,
  color = 'pink',
  full = false,
}: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={valueText ?? `${pct}%`}
      className="h-3.5 overflow-hidden rounded-full bg-track"
    >
      <div
        className="relative h-full overflow-hidden rounded-full transition-[width] duration-[600ms] ease-[var(--ease-out)]"
        style={{
          width: `${pct}%`,
          background: full ? 'var(--color-coin)' : PIG_COLORS[color].strong,
        }}
      >
        {pct > 0 && <span aria-hidden="true" className="progress-shine" />}
      </div>
    </div>
  )
}
