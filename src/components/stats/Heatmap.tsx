import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  parseLocalDate,
  type DailyTotals,
  type HeatCell,
  type HeatLevel,
  heatmapWeeks,
} from '../../domain/stats'
import { formatMinutesShort } from '../../domain/time'
import { cn } from '../../lib/cn'

// Sizes are CSS values so the squares can grow on wide screens (--cell is set on the wrapper).
const GAP = 4
const LABEL_W = 36
const HEAD_H = 22
const CELL = 'var(--cell)'
const STEP = `calc(var(--cell) + ${GAP}px)`

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
export function Heatmap({ totals, today }: { totals: DailyTotals; today: string }) {
  const weeks = heatmapWeeks(totals, today)
  const gridRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Roving tabindex: start on today, the last real cell.
  const lastCol = weeks.length - 1
  const todayRow = weeks[lastCol].reduce((last, cell, r) => (cell ? r : last), 0)
  const [current, setCurrent] = useState<Pos>({ r: todayRow, c: lastCol })
  const [tip, setTip] = useState<Pos | null>(null)

  // Show the most recent weeks first on narrow screens.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

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

  const tipCell = tip ? cellAt(tip) : null
  const labels = monthLabels(weeks)
  const width = `calc(${LABEL_W}px + ${weeks.length} * ${STEP} - ${GAP}px)`

  return (
    <div>
      <div ref={scrollRef} className="overflow-x-auto pb-2 pt-5">
        <div
          className="relative mx-auto [--cell:16px] md:[--cell:24px]"
          style={{ width }}
        >
          <div
            aria-hidden="true"
            className="relative"
            style={{ height: HEAD_H, marginLeft: LABEL_W }}
          >
            {labels.map((l) => (
              <span
                key={l.col}
                className="absolute top-0 text-xs font-bold text-text-muted"
                style={{ left: `calc(${l.col} * ${STEP})` }}
              >
                {l.text}
              </span>
            ))}
          </div>

          <div
            ref={gridRef}
            role="grid"
            aria-label="Saving days over the last 26 weeks. Use the arrow keys to move between days."
            onKeyDown={onKeyDown}
            className="flex flex-col"
            style={{ gap: GAP }}
          >
            {WEEKDAYS.map((weekday, r) => (
              <div key={r} role="row" className="flex items-center" style={{ gap: GAP }}>
                <span
                  aria-hidden="true"
                  className="sticky left-0 z-[1] bg-surface text-xs font-bold text-text-muted"
                  style={{ width: LABEL_W - GAP, flex: 'none' }}
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
                        style={{ width: CELL, height: CELL, flex: 'none' }}
                      />
                    )
                  }
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
                        'cursor-default rounded-[4px]',
                        LEVEL_CLASS[cell.level],
                      )}
                      style={{ width: CELL, height: CELL, flex: 'none' }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {tip && tipCell && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-sm bg-text px-3 py-1.5 text-sm font-bold text-white shadow-card"
              style={{
                left: `clamp(64px, calc(${LABEL_W}px + ${tip.c} * ${STEP} + ${CELL} / 2), calc(${width} - 64px))`,
                top: `calc(${HEAD_H}px + ${tip.r} * ${STEP} - 8px)`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {describeDay(tipCell)}
            </div>
          )}
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
            className={cn('inline-block rounded-[4px]', LEVEL_CLASS[l])}
            style={{ width: 16, height: 16 }}
          />
        ))}
        More
      </div>
    </div>
  )
}
