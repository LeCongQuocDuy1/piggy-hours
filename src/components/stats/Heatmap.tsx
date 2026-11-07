import { useRef, useState, type KeyboardEvent } from 'react'
import {
  parseLocalDate,
  type DailyTotals,
  type HeatCell,
  type HeatLevel,
  HEATMAP_WEEKS,
  heatmapWeeks,
} from '../../domain/stats'
import { formatMinutesShort } from '../../domain/time'
import { cn } from '../../lib/cn'

// The grid always fits its container (no sideways scroll): squares are fluid and keep a 1:1 shape. Month labels
// are placed by percentage, using the same column step as the squares.
const LABEL_W = 30
const HEAD_H = 18

const LEVEL_CLASS: Record<HeatLevel, string> = {
  0: 'bg-heat-0',
  1: 'bg-heat-1',
  2: 'bg-heat-2',
  3: 'bg-heat-3',
  4: 'bg-heat-4',
}

const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

function describeDay(cell: HeatCell): string {
  const date = parseLocalDate(cell.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${date}: ${cell.minutes > 0 ? formatMinutesShort(cell.minutes) : 'no time'}`
}

/** Month labels sit above the first column of each month; labels closer than 3 columns apart are skipped. */
function monthLabels(weeks: (HeatCell | null)[][]) {
  const labels: { col: number; text: string }[] = []
  let lastMonth = -1
  let lastCol = -10
  weeks.forEach((week, col) => {
    const first = week[0]
    if (!first) return
    const month = parseLocalDate(first.date).getMonth()
    if (month !== lastMonth && col - lastCol >= 3) {
      labels.push({
        col,
        text: parseLocalDate(first.date).toLocaleDateString('en-US', { month: 'short' }),
      })
      lastCol = col
    }
    lastMonth = month
  })
  return labels
}

type Pos = { r: number; c: number }

/**
 * GitHub-style saving-days heatmap (docs/DESIGN.md section 22.1). Columns are weeks, rows are Monday to Sunday.
 * It is one tab stop; arrow keys move between days, and the date and total show in a tooltip on hover, focus or tap.
 */
export function Heatmap({
  totals,
  today,
  weekCount = HEATMAP_WEEKS,
}: {
  totals: DailyTotals
  today: string
  /** How many weeks to show; phones show fewer so the squares stay a comfortable size without scrolling. */
  weekCount?: number
}) {
  const weeks = heatmapWeeks(totals, today, weekCount)
  const gridRef = useRef<HTMLDivElement>(null)

  // Roving tabindex: start on today, the last real cell.
  const lastCol = weeks.length - 1
  const todayRow = weeks[lastCol].reduce((last, cell, r) => (cell ? r : last), 0)
  const [current, setCurrent] = useState<Pos>({ r: todayRow, c: lastCol })
  const [tip, setTip] = useState<Pos | null>(null)

  function cellAt({ r, c }: Pos): HeatCell | null {
    return weeks[c]?.[r] ?? null
  }

  function move(next: Pos) {
    if (!cellAt(next)) return
    setCurrent(next)
    setTip(next)
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-r="${next.r}"][data-c="${next.c}"]`)
      ?.focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    const { r, c } = current
    const target: Record<string, Pos> = {
      ArrowUp: { r: r - 1, c },
      ArrowDown: { r: r + 1, c },
      ArrowLeft: { r, c: c - 1 },
      ArrowRight: { r, c: c + 1 },
      Home: { r, c: 0 },
      End: { r, c: cellAt({ r, c: lastCol }) ? lastCol : lastCol - 1 },
    }
    const next = target[e.key]
    if (!next) return
    e.preventDefault()
    move(next)
  }

  const labels = monthLabels(weeks)
  const cols = weeks.length

  return (
    <div className="mx-auto max-w-[760px] [--gap:3px] md:[--gap:4px]">
      <div className="pb-1 pt-2">
        <div
          aria-hidden="true"
          className="relative"
          style={{ height: HEAD_H, marginLeft: LABEL_W }}
        >
          {labels.map((l) => (
            <span
              key={l.col}
              className="absolute top-0 whitespace-nowrap text-[11px] font-bold text-text-muted md:text-xs"
              style={{ left: `calc((100% + var(--gap)) * ${l.col} / ${cols})` }}
            >
              {l.text}
            </span>
          ))}
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-label={`Saving days over the last ${weekCount} weeks. Use the arrow keys to move between days.`}
          onKeyDown={onKeyDown}
          className="flex flex-col gap-[var(--gap)]"
        >
          {WEEKDAYS.map((weekday, r) => (
            <div key={r} role="row" className="flex items-center gap-[var(--gap)]">
              <span
                aria-hidden="true"
                className="flex-none text-[11px] font-bold leading-none text-text-muted md:text-xs"
                style={{ width: `calc(${LABEL_W}px - var(--gap))` }}
              >
                {weekday}
              </span>
              {weeks.map((week, c) => {
                const cell = week[r]
                if (!cell) {
                  return (
                    <div
                      key={c}
                      role="gridcell"
                      aria-disabled="true"
                      aria-label="Not yet"
                      className="aspect-square min-w-0 flex-1"
                    />
                  )
                }
                const showTip = tip?.r === r && tip.c === c
                // Tooltips near the left or right edge are anchored to that edge so they never leave the card.
                const align =
                  c < 7
                    ? 'left-0'
                    : c > cols - 8
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2'
                return (
                  <div
                    key={c}
                    role="gridcell"
                    data-r={r}
                    data-c={c}
                    data-level={cell.level}
                    tabIndex={current.r === r && current.c === c ? 0 : -1}
                    aria-label={describeDay(cell)}
                    onMouseEnter={() => setTip({ r, c })}
                    onMouseLeave={() => setTip(null)}
                    onFocus={() => {
                      setCurrent({ r, c })
                      setTip({ r, c })
                    }}
                    onBlur={() => setTip(null)}
                    className={cn(
                      'relative aspect-square min-w-0 flex-1 cursor-default rounded-[3px] md:rounded-[4px]',
                      LEVEL_CLASS[cell.level],
                    )}
                  >
                    {showTip && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          'pointer-events-none absolute bottom-[calc(100%+6px)] z-10 whitespace-nowrap rounded-sm bg-text px-3 py-1.5 text-sm font-bold text-white shadow-card',
                          align,
                        )}
                      >
                        {describeDay(cell)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden="true"
        className="mt-2 flex items-center justify-end gap-1.5 text-xs font-bold text-text-muted"
      >
        Less
        {([0, 1, 2, 3, 4] as const).map((l) => (
          <span
            key={l}
            className={cn('inline-block size-3 rounded-[3px] md:size-4', LEVEL_CLASS[l])}
          />
        ))}
        More
      </div>
    </div>
  )
}
